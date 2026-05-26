import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';

import { PrismaService } from '../common/prisma/prisma.service';

const BATCH_SIZE = 50;
const MAX_BACKOFF_MS = 5 * 60 * 1000; // 5 min cap

function backoffMs(attempts: number): number {
  return Math.min(Math.pow(2, attempts) * 1000, MAX_BACKOFF_MS);
}

@Injectable()
export class OutboxRelayService implements OnModuleInit {
  private readonly logger = new Logger(OutboxRelayService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('domain-events') private readonly queue: Queue,
  ) {}

  onModuleInit() {
    // Relay-tick is registered as a BullMQ repeatable job in EventsModule
  }

  async drain(): Promise<void> {
    const start = Date.now();

    let rows: Awaited<ReturnType<typeof this.prisma.outboxEvent.findMany>>;
    try {
      rows = await this.prisma.outboxEvent.findMany({
        where: {
          status: 'pending',
          availableAt: { lte: new Date() },
        },
        take: BATCH_SIZE,
        orderBy: { availableAt: 'asc' },
      });
    } catch (err: unknown) {
      this.logger.error({
        durationMs: Date.now() - start,
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }

    if (rows.length === 0) {
      return;
    }

    for (const row of rows) {
      try {
        const envelope = {
          eventId: row.eventId,
          type: row.type,
          aggregateId: row.aggregateId,
          orgId: row.orgId,
          payload: row.payload,
          occurredAt: row.occurredAt,
        };

        await this.queue.add('domain-event', envelope, {
          jobId: row.eventId,
          attempts: 5,
          backoff: { type: 'exponential', delay: 1000 },
        });

        await this.prisma.outboxEvent.update({
          where: { id: row.id },
          data: {
            status: 'published',
            processedAt: new Date(),
          },
        });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        this.logger.warn(`OutboxRelay: failed to enqueue eventId=${row.eventId} — ${errorMessage}`);

        const newAttempts = row.attempts + 1;

        await this.prisma.outboxEvent.update({
          where: { id: row.id },
          data: {
            status: 'pending',
            attempts: newAttempts,
            availableAt: new Date(Date.now() + backoffMs(newAttempts)),
            lastError: errorMessage,
          },
        });
      }
    }

    this.logger.log({
      processedCount: rows.length,
      durationMs: Date.now() - start,
      success: true,
    });
  }
}
