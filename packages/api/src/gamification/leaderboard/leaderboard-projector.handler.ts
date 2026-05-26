import { Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { EVENT_TYPES, type EventType } from '../../events/event-types';
import type { DomainEvent } from '../../events/event.types';
import type { DomainEventHandler } from '../../events/interfaces/domain-event-handler.interface';

/**
 * EXP-changing events that affect global leaderboard ranking.
 * ACHIEVEMENT_UNLOCKED is excluded — it does not change totalExp/level/streak.
 */
const EXP_CHANGING_EVENTS: readonly EventType[] = [
  EVENT_TYPES.QUEST_COMPLETED,
  EVENT_TYPES.WORKOUT_LOGGED,
  EVENT_TYPES.ANIME_PROGRESSED,
  EVENT_TYPES.ANIME_COMPLETED,
  EVENT_TYPES.MANGA_PROGRESSED,
  EVENT_TYPES.DAILY_LOGIN,
  EVENT_TYPES.LEVEL_UP,
] as const;

@Injectable()
export class LeaderboardProjectorHandler implements DomainEventHandler {
  readonly name = 'leaderboard-projector';
  readonly handles: readonly EventType[] = EXP_CHANGING_EVENTS;

  private readonly logger = new Logger(LeaderboardProjectorHandler.name);

  async handle(event: DomainEvent, tx: Prisma.TransactionClient): Promise<void> {
    const userId = this.extractUserId(event);

    if (!userId) {
      this.logger.warn(
        `LeaderboardProjectorHandler: cannot extract userId for event ${event.eventId}`,
      );
      return;
    }

    // Idempotent upsert — PK on userId guarantees one row per user regardless
    // of how many EXP events fire before the cron runs.
    // A crash between handle() and EventHandlerLog.create() can re-run this,
    // but the upsert update:{} is a no-op, keeping it safe.
    await tx.dirtyLeaderboardUser.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  private extractUserId(event: DomainEvent): string | null {
    if (typeof event.payload === 'object' && event.payload !== null && 'userId' in event.payload) {
      const userId = (event.payload as { userId: unknown }).userId;
      return typeof userId === 'string' && userId.length > 0 ? userId : null;
    }
    return null;
  }
}
