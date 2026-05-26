import { Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';
import { EventBusService } from '../../events/event-bus.service';
import { EVENT_TYPES, type EventType } from '../../events/event-types';
import type { DomainEvent } from '../../events/event.types';
import type { DomainEventHandler } from '../../events/interfaces/domain-event-handler.interface';
import { parseCondition, type AchievementCondition } from './condition.schema';

type AchievementRow = {
  id: string;
  code: string;
  triggers: string[];
  condition: unknown;
};

type ProfileAggregates = {
  level: number;
  currentStreak: number;
  questsCompleted: number;
  workoutsLogged: number;
  animesCompleted: number;
  chaptersRead: number;
};

@Injectable()
export class AchievementEvaluationHandler implements DomainEventHandler {
  readonly name = 'achievement-evaluation';
  readonly handles: readonly EventType[] = [
    EVENT_TYPES.QUEST_COMPLETED,
    EVENT_TYPES.WORKOUT_LOGGED,
    EVENT_TYPES.ANIME_PROGRESSED,
    EVENT_TYPES.ANIME_COMPLETED,
    EVENT_TYPES.MANGA_PROGRESSED,
    EVENT_TYPES.DAILY_LOGIN,
    EVENT_TYPES.LEVEL_UP,
  ] as const;

  private readonly logger = new Logger(AchievementEvaluationHandler.name);

  constructor(
    private readonly _prisma: PrismaService,
    private readonly eventBus: EventBusService,
  ) {}

  async handle(event: DomainEvent, tx: Prisma.TransactionClient): Promise<void> {
    const userId = this.extractUserId(event);
    const orgId = event.orgId ?? '';

    if (!userId) {
      return;
    }

    // Load achievements triggered by this event type
    const achievements = (await tx.achievement.findMany({
      where: {
        triggers: { has: event.type },
        active: true,
      },
    })) as AchievementRow[];

    if (achievements.length === 0) {
      return;
    }

    // Load already-unlocked achievements to skip
    const alreadyUnlocked = await tx.userAchievement.findMany({
      where: { userId, organizationId: orgId },
      select: { achievementId: true },
    });
    const unlockedIds = new Set(
      alreadyUnlocked.map((ua: { achievementId: string }) => ua.achievementId),
    );

    // Load profile for aggregates
    const profile = await tx.profile.findUnique({
      where: { userId },
      select: { id: true, level: true, currentStreak: true },
    });

    if (!profile) {
      return;
    }

    // Load counters lazily (only if needed)
    const aggregates = await this.loadAggregates(tx, userId, orgId, profile, achievements);

    for (const achievement of achievements) {
      if (unlockedIds.has(achievement.id)) {
        continue;
      }

      let condition: AchievementCondition;
      try {
        condition = parseCondition(achievement.condition);
      } catch {
        this.logger.warn(`AchievementEvaluationHandler: invalid condition for ${achievement.code}`);
        continue;
      }

      if (!this.evaluateCondition(condition, aggregates)) {
        continue;
      }

      // Upsert to prevent duplicates (idempotent)
      await tx.userAchievement.upsert({
        where: {
          userId_organizationId_achievementId: {
            userId,
            organizationId: orgId,
            achievementId: achievement.id,
          },
        },
        create: {
          userId,
          organizationId: orgId,
          achievementId: achievement.id,
        },
        update: {}, // no-op if already exists
      });

      const unlockEvent = this.eventBus.buildEvent(
        EVENT_TYPES.ACHIEVEMENT_UNLOCKED,
        userId,
        {
          userId,
          orgId,
          achievementCode: achievement.code,
          unlockedAt: new Date(),
        },
        orgId,
      );

      await this.eventBus.emit(tx, unlockEvent);

      this.logger.log(
        `AchievementEvaluationHandler: userId=${userId} unlocked achievement=${achievement.code}`,
      );
    }
  }

  private evaluateCondition(
    condition: AchievementCondition,
    aggregates: ProfileAggregates,
  ): boolean {
    const value = this.getMetricValue(condition.metric, aggregates);
    if (value === undefined) return false;

    return condition.comparator === 'gte' ? value >= condition.value : value === condition.value;
  }

  private getMetricValue(metric: string, aggregates: ProfileAggregates): number | undefined {
    const map: Record<string, number> = {
      questsCompleted: aggregates.questsCompleted,
      currentStreak: aggregates.currentStreak,
      level: aggregates.level,
      workoutsLogged: aggregates.workoutsLogged,
      animesCompleted: aggregates.animesCompleted,
      chaptersRead: aggregates.chaptersRead,
    };
    return map[metric];
  }

  private async loadAggregates(
    tx: Prisma.TransactionClient,
    userId: string,
    orgId: string,
    profile: { level: number; currentStreak: number },
    achievements: AchievementRow[],
  ): Promise<ProfileAggregates> {
    const neededMetrics = new Set(
      achievements
        .map((a) => {
          try {
            return parseCondition(a.condition).metric;
          } catch {
            return null;
          }
        })
        .filter(Boolean) as string[],
    );

    const questsCompleted = neededMetrics.has('questsCompleted')
      ? await tx.questCompletion.count({ where: { userId, organizationId: orgId } })
      : 0;

    const workoutsLogged = neededMetrics.has('workoutsLogged')
      ? await tx.workoutSession.count({
          where: { userId, organizationId: orgId, status: 'completed' },
        })
      : 0;

    const animesCompleted = neededMetrics.has('animesCompleted')
      ? await tx.animeEntry.count({
          where: { userId, organizationId: orgId, status: 'completed' },
        })
      : 0;

    let chaptersRead = 0;
    if (neededMetrics.has('chaptersRead')) {
      const result = await tx.mangaEntry.findMany({
        where: { userId, organizationId: orgId },
        select: { ownedVolumes: true },
      });
      chaptersRead = (result as { ownedVolumes: number[] }[]).reduce(
        (sum, entry) => sum + entry.ownedVolumes.length,
        0,
      );
    }

    return {
      level: profile.level,
      currentStreak: profile.currentStreak,
      questsCompleted,
      workoutsLogged,
      animesCompleted,
      chaptersRead,
    };
  }

  private extractUserId(event: DomainEvent): string | null {
    if (typeof event.payload === 'object' && event.payload !== null && 'userId' in event.payload) {
      const userId = (event.payload as { userId: string }).userId;
      return typeof userId === 'string' ? userId : null;
    }
    return null;
  }
}
