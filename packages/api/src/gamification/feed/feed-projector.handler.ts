import { Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { WIRE_EVENTS } from '@freakdays/domain';
import type { FeedEntryAddedPayload } from '@freakdays/domain';

import { EVENT_TYPES, type EventType } from '../../events/event-types';
import type { DomainEvent } from '../../events/event.types';
import type {
  DeferFn,
  DomainEventHandler,
} from '../../events/interfaces/domain-event-handler.interface';
import type { RealtimeGateway } from '../../realtime/realtime.gateway';

/** Domain event types that project into the activity feed */
const FEED_EVENTS = new Set<string>([
  EVENT_TYPES.LEVEL_UP,
  EVENT_TYPES.ACHIEVEMENT_UNLOCKED,
  EVENT_TYPES.QUEST_COMPLETED,
  EVENT_TYPES.WORKOUT_LOGGED,
]);

@Injectable()
export class FeedProjectorHandler implements DomainEventHandler {
  readonly name = 'feed-projector';

  readonly handles: readonly EventType[] = [
    EVENT_TYPES.LEVEL_UP,
    EVENT_TYPES.ACHIEVEMENT_UNLOCKED,
    EVENT_TYPES.QUEST_COMPLETED,
    EVENT_TYPES.WORKOUT_LOGGED,
  ] as const;

  private readonly logger = new Logger(FeedProjectorHandler.name);

  constructor(private readonly gateway: RealtimeGateway) {}

  async handle(event: DomainEvent, tx: Prisma.TransactionClient, defer?: DeferFn): Promise<void> {
    // Skip events not in the feed allowlist
    if (!FEED_EVENTS.has(event.type)) {
      return;
    }

    const actorUserId = this.extractUserId(event);

    if (!actorUserId) {
      this.logger.warn(`FeedProjectorHandler: cannot extract userId for event ${event.eventId}`);
      return;
    }

    // Idempotency check — per-(eventId, handler) log
    const existingLog = await tx.eventHandlerLog.findUnique({
      where: { eventId_handler: { eventId: event.eventId, handler: this.name } },
    });

    if (existingLog) {
      this.logger.debug(
        `FeedProjectorHandler: already processed eventId=${event.eventId} — skipping`,
      );
      return;
    }

    // Write idempotency log row
    await tx.eventHandlerLog.create({
      data: { eventId: event.eventId, handler: this.name },
    });

    // Resolve all parties the actor belongs to
    const memberships = await tx.partyMember.findMany({
      where: { userId: actorUserId },
      select: { partyId: true },
    });

    if (memberships.length === 0) {
      return;
    }

    const renderedPayload = this.renderPayload(event);

    for (const { partyId } of memberships) {
      let entry: { id: string; createdAt: Date } | null = null;

      try {
        entry = await tx.feedEntry.create({
          data: {
            partyId,
            actorUserId,
            type: event.type,
            payload: renderedPayload as Prisma.InputJsonValue,
            sourceEventId: event.eventId,
          },
          select: { id: true, createdAt: true },
        });
      } catch (err: unknown) {
        // Swallow unique constraint violations (P2002) — idempotency safety net
        if (
          typeof err === 'object' &&
          err !== null &&
          'code' in err &&
          (err as { code: string }).code === 'P2002'
        ) {
          this.logger.debug(
            `FeedProjectorHandler: duplicate feedEntry for partyId=${partyId} eventId=${event.eventId} — skipped`,
          );
          continue;
        }
        throw err;
      }

      // Defer post-commit push — best-effort, non-blocking
      if (defer && entry) {
        const view: FeedEntryAddedPayload = {
          id: entry.id,
          partyId,
          type: event.type,
          actorUserId,
          actorName: null,
          payload: renderedPayload,
          createdAt: entry.createdAt.toISOString(),
        };

        defer(() => {
          this.gateway.emitToParty(partyId, WIRE_EVENTS.FEED_ENTRY_ADDED, view);
        });
      }
    }
  }

  private extractUserId(event: DomainEvent): string | null {
    if (typeof event.payload === 'object' && event.payload !== null && 'userId' in event.payload) {
      const userId = (event.payload as { userId: unknown }).userId;
      return typeof userId === 'string' && userId.length > 0 ? userId : null;
    }
    return null;
  }

  private renderPayload(event: DomainEvent): Record<string, unknown> {
    if (typeof event.payload === 'object' && event.payload !== null) {
      return event.payload as Record<string, unknown>;
    }
    return {};
  }
}
