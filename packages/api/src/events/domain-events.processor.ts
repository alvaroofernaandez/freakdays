import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';

import { PrismaService } from '../common/prisma/prisma.service';
import { EVENT_TYPES } from './event-types';
import type { DomainEvent } from './event.types';
import { QuestCompletedHandler } from './handlers/quest-completed.handler';

@Processor('domain-events')
@Injectable()
export class DomainEventsProcessor extends WorkerHost {
  private readonly logger = new Logger(DomainEventsProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly questCompletedHandler: QuestCompletedHandler,
  ) {
    super();
  }

  async process(job: Job<DomainEvent>): Promise<void> {
    const event = job.data;

    // Idempotency check — if already processed, ack and return
    const already = await this.prisma.processedEvent.findUnique({
      where: { eventId: event.eventId },
    });

    if (already) {
      this.logger.log(
        `DomainEventsProcessor: duplicate eventId=${event.eventId} — skipping (idempotent no-op)`,
      );
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      switch (event.type) {
        case EVENT_TYPES.QUEST_COMPLETED:
          await this.questCompletedHandler.handle(event as never, tx);
          break;

        default:
          this.logger.warn(
            `DomainEventsProcessor: no handler for event type "${event.type}" — skipping`,
          );
          // Insert ProcessedEvent so we don't reprocess unknown events
          await tx.processedEvent.create({
            data: { eventId: event.eventId, type: event.type },
          });
          break;
      }
    });
  }
}
