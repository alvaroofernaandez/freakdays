import { Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { WIRE_EVENTS } from '@freakdays/domain';
import type {
  LevelUpPayload as WireLevelUpPayload,
  AchievementUnlockedPayload as WireAchievementUnlockedPayload,
} from '@freakdays/domain';

import { EVENT_TYPES, type EventType } from '../events/event-types';
import type {
  DomainEvent,
  LevelUpPayload,
  AchievementUnlockedPayload,
} from '../events/event.types';
import type {
  DeferFn,
  DomainEventHandler,
} from '../events/interfaces/domain-event-handler.interface';
import { RealtimeGateway } from './realtime.gateway';

@Injectable()
export class RealtimePushHandler implements DomainEventHandler {
  readonly name = 'realtime-push';

  readonly handles: readonly EventType[] = [
    EVENT_TYPES.LEVEL_UP,
    EVENT_TYPES.ACHIEVEMENT_UNLOCKED,
    EVENT_TYPES.QUEST_COMPLETED,
    EVENT_TYPES.WORKOUT_LOGGED,
    EVENT_TYPES.ANIME_PROGRESSED,
    EVENT_TYPES.ANIME_COMPLETED,
    EVENT_TYPES.MANGA_PROGRESSED,
    EVENT_TYPES.DAILY_LOGIN,
  ] as const;

  private readonly logger = new Logger(RealtimePushHandler.name);

  constructor(private readonly gateway: RealtimeGateway) {}

  async handle(event: DomainEvent, tx: Prisma.TransactionClient, defer?: DeferFn): Promise<void> {
    if (!defer) return;

    const userId = this.extractUserId(event);

    if (!userId) {
      this.logger.error(`RealtimePushHandler: cannot extract userId for event ${event.eventId}`);
      return;
    }

    switch (event.type) {
      case EVENT_TYPES.LEVEL_UP: {
        const payload = event.payload as LevelUpPayload;

        if (
          typeof payload.previousLevel !== 'number' ||
          typeof payload.newLevel !== 'number' ||
          typeof payload.totalExp !== 'number'
        ) {
          this.logger.error(
            `RealtimePushHandler: level.up event ${event.eventId} missing required payload fields`,
          );
          return;
        }

        const wirePayload: WireLevelUpPayload = {
          previousLevel: payload.previousLevel,
          newLevel: payload.newLevel,
          totalExp: payload.totalExp,
        };

        defer(() => this.gateway.emitToUser(userId, WIRE_EVENTS.LEVEL_UP, wirePayload));
        defer(() => this.gateway.emitToUser(userId, WIRE_EVENTS.STATS_UPDATED, {}));
        break;
      }

      case EVENT_TYPES.ACHIEVEMENT_UNLOCKED: {
        const payload = event.payload as AchievementUnlockedPayload;
        const { achievementCode } = payload;

        const catalogRow = await tx.achievement.findUnique({
          where: { code: achievementCode },
          select: { code: true, name: true, description: true, iconKey: true },
        });

        if (!catalogRow) {
          this.logger.error(
            `RealtimePushHandler: achievement code "${achievementCode}" not found in catalog (event ${event.eventId})`,
          );
          return;
        }

        const wirePayload: WireAchievementUnlockedPayload = {
          code: catalogRow.code,
          name: catalogRow.name,
          description: catalogRow.description,
          ...(catalogRow.iconKey != null ? { iconKey: catalogRow.iconKey } : {}),
        };

        defer(() => this.gateway.emitToUser(userId, WIRE_EVENTS.ACHIEVEMENT_UNLOCKED, wirePayload));
        defer(() => this.gateway.emitToUser(userId, WIRE_EVENTS.STATS_UPDATED, {}));
        break;
      }

      default: {
        // All other progression events — signal client to refetch stats
        defer(() => this.gateway.emitToUser(userId, WIRE_EVENTS.STATS_UPDATED, {}));
        break;
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
}
