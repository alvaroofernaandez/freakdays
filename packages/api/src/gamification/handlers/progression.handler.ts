import { Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { ACTIVITY_EXP, computeLevel, computeStreakBonusPct, effectiveExp } from '@freakdays/domain';

import { PrismaService } from '../../common/prisma/prisma.service';
import { EventBusService } from '../../events/event-bus.service';
import { EVENT_TYPES, type EventType } from '../../events/event-types';
import type {
  AchievementUnlockedPayload,
  AnimeCompletedPayload,
  AnimeProgressedPayload,
  DailyLoginPayload,
  DomainEvent,
  MangaProgressedPayload,
  QuestCompletedPayload,
  WorkoutLoggedPayload,
} from '../../events/event.types';
import type { DomainEventHandler } from '../../events/interfaces/domain-event-handler.interface';

type SupportedPayload =
  | WorkoutLoggedPayload
  | AnimeProgressedPayload
  | AnimeCompletedPayload
  | MangaProgressedPayload
  | DailyLoginPayload
  | QuestCompletedPayload
  | AchievementUnlockedPayload;

@Injectable()
export class ProgressionHandler implements DomainEventHandler {
  readonly name = 'progression';
  readonly handles: readonly EventType[] = [
    EVENT_TYPES.WORKOUT_LOGGED,
    EVENT_TYPES.ANIME_PROGRESSED,
    EVENT_TYPES.ANIME_COMPLETED,
    EVENT_TYPES.MANGA_PROGRESSED,
    EVENT_TYPES.DAILY_LOGIN,
    EVENT_TYPES.QUEST_COMPLETED,
  ] as const;

  private readonly logger = new Logger(ProgressionHandler.name);

  constructor(
    private readonly _prisma: PrismaService,
    private readonly eventBus: EventBusService,
  ) {}

  async handle(event: DomainEvent<SupportedPayload>, tx: Prisma.TransactionClient): Promise<void> {
    const userId = this.extractUserId(event);

    if (!userId) {
      this.logger.warn(`ProgressionHandler: cannot extract userId for event ${event.eventId}`);
      return;
    }

    const profile = await tx.profile.findUnique({
      where: { userId },
      select: { id: true, totalExp: true, level: true, currentStreak: true },
    });

    if (!profile) {
      this.logger.warn(`ProgressionHandler: no profile for userId=${userId}`);
      return;
    }

    const baseExp = this.resolveBaseExp(event);
    // Read streak from Profile (single source — StreakHandler writes it, ProgressionHandler reads it).
    const streak = profile.currentStreak ?? 0;
    const expGrant = effectiveExp(baseExp, streak);

    const oldLevel = computeLevel(profile.totalExp);
    const newTotal = profile.totalExp + expGrant;
    const newLevel = computeLevel(newTotal);

    await tx.profile.update({
      where: { id: profile.id },
      data: {
        totalExp: newTotal,
        level: newLevel,
      },
    });

    // Emit level.up if level boundary crossed
    if (newLevel > oldLevel) {
      const orgId = event.orgId ?? '';
      const levelUpEvent = this.eventBus.buildEvent(
        EVENT_TYPES.LEVEL_UP,
        userId,
        {
          userId,
          orgId,
          previousLevel: oldLevel,
          newLevel,
          totalExp: newTotal,
        },
        orgId,
      );

      await this.eventBus.emit(tx, levelUpEvent);
      this.logger.log(
        `ProgressionHandler: level.up for userId=${userId} ${oldLevel} → ${newLevel}`,
      );
    }

    this.logger.log(
      `ProgressionHandler: userId=${userId} +${expGrant} EXP → totalExp=${newTotal}, level=${newLevel}`,
    );
  }

  private extractUserId(event: DomainEvent<SupportedPayload>): string | null {
    if (typeof event.payload === 'object' && event.payload !== null && 'userId' in event.payload) {
      const userId = (event.payload as { userId: string }).userId;
      return typeof userId === 'string' ? userId : null;
    }
    return null;
  }

  private resolveBaseExp(event: DomainEvent<SupportedPayload>): number {
    switch (event.type) {
      case EVENT_TYPES.WORKOUT_LOGGED:
        return ACTIVITY_EXP.workout;
      case EVENT_TYPES.ANIME_PROGRESSED:
        return ACTIVITY_EXP.animeEpisode;
      case EVENT_TYPES.ANIME_COMPLETED:
        return ACTIVITY_EXP.animeComplete;
      case EVENT_TYPES.MANGA_PROGRESSED: {
        const mangaPayload = event.payload as MangaProgressedPayload;
        return ACTIVITY_EXP.mangaChapter * (mangaPayload.chaptersRead ?? 1);
      }
      case EVENT_TYPES.DAILY_LOGIN:
        return ACTIVITY_EXP.dailyLogin;
      case EVENT_TYPES.QUEST_COMPLETED: {
        const questPayload = event.payload as QuestCompletedPayload;
        return questPayload.expAwarded;
      }
      default:
        return 0;
    }
  }

  // Kept for test compatibility — streak bonus is also used inline
  computeStreakBonusPct = computeStreakBonusPct;
}
