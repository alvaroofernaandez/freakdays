import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';

import { PrismaService } from '../common/prisma/prisma.service';
import type { EventType } from './event-types';
import type { DomainEvent } from './event.types';
import { DOMAIN_EVENT_HANDLERS } from './events.constants';
import type { DomainEventHandler } from './interfaces/domain-event-handler.interface';

@Processor('domain-events')
@Injectable()
export class DomainEventsProcessor extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(DomainEventsProcessor.name);
  private readonly registry = new Map<EventType, DomainEventHandler[]>();

  constructor(
    private readonly prisma: PrismaService,
    @Inject(DOMAIN_EVENT_HANDLERS)
    private readonly handlers: DomainEventHandler[],
  ) {
    super();
  }

  onModuleInit(): void {
    for (const handler of this.handlers) {
      for (const eventType of handler.handles) {
        const existing = this.registry.get(eventType) ?? [];
        existing.push(handler);
        this.registry.set(eventType, existing);
      }
    }

    this.logger.log(
      `DomainEventsProcessor: registry built with ${this.handlers.length} handler(s) for ${this.registry.size} event type(s)`,
    );
  }

  async process(job: Job<DomainEvent>): Promise<void> {
    const event = job.data;
    const eventHandlers = this.registry.get(event.type as EventType);

    if (!eventHandlers || eventHandlers.length === 0) {
      this.logger.warn(
        `DomainEventsProcessor: no handler for event type "${event.type}" — skipping`,
      );
      return;
    }

    for (const handler of eventHandlers) {
      await this.runHandler(event, handler);
    }
  }

  private async runHandler(event: DomainEvent, handler: DomainEventHandler): Promise<void> {
    const deferred: Array<() => void | Promise<void>> = [];
    const defer = (fn: () => void | Promise<void>): void => {
      deferred.push(fn);
    };

    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.eventHandlerLog.findUnique({
        where: { eventId_handler: { eventId: event.eventId, handler: handler.name } },
      });

      if (existing) {
        this.logger.log(
          `DomainEventsProcessor: handler=${handler.name} already processed eventId=${event.eventId} — no-op`,
        );
        return;
      }

      await handler.handle(event, tx, defer);

      await tx.eventHandlerLog.create({
        data: { eventId: event.eventId, handler: handler.name },
      });
    });

    // Flush post-commit deferred effects. Each fn is wrapped in try/catch so a
    // failed socket emit never fails the BullMQ job (push is best-effort).
    for (const fn of deferred) {
      try {
        await fn();
      } catch (err: unknown) {
        this.logger.warn(
          `DomainEventsProcessor: post-commit deferred fn for handler=${handler.name} threw — ${String(err)}`,
        );
      }
    }
  }
}
