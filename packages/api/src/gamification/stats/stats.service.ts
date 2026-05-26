import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';

type UserStatsRow = {
  id: string;
  userId: string;
  organizationId: string;
  questsPending: number;
  questsDoneToday: number;
  animesInProgress: number;
  workoutsThisWeek: number;
  totalExp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  achievementsCount: number;
  windowDate: Date | null;
  updatedAt: Date;
};

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getStats(userId: string, organizationId: string): Promise<UserStatsRow | null> {
    return this.prisma.userStats.findUnique({
      where: {
        userId_organizationId: { userId, organizationId },
      },
    }) as Promise<UserStatsRow | null>;
  }

  async rebuild(userId: string, organizationId: string): Promise<UserStatsRow | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: {
        totalExp: true,
        level: true,
        currentStreak: true,
        longestStreak: true,
      },
    });

    if (!profile) {
      this.logger.warn(`StatsService.rebuild: no profile for userId=${userId}`);
      return null;
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const [questsPending, questsDoneToday, animesInProgress, workoutsThisWeek, achievementsCount] =
      await Promise.all([
        this.prisma.quest.count({
          where: {
            userId,
            organizationId,
            active: true,
            completions: { none: { userId, organizationId } },
          },
        }),
        this.prisma.questCompletion.count({
          where: { userId, organizationId, completedAt: { gte: startOfDay } },
        }),
        this.prisma.animeEntry.count({
          where: { userId, organizationId, status: 'watching' },
        }),
        this.prisma.workoutSession.count({
          where: {
            userId,
            organizationId,
            status: 'completed',
            workoutDate: { gte: this.startOfWeek(today) },
          },
        }),
        this.prisma.userAchievement.count({
          where: { userId, organizationId },
        }),
      ]);

    const data = {
      userId,
      organizationId,
      questsPending,
      questsDoneToday,
      animesInProgress,
      workoutsThisWeek,
      totalExp: profile.totalExp,
      level: profile.level,
      currentStreak: profile.currentStreak,
      longestStreak: profile.longestStreak,
      achievementsCount,
      windowDate: startOfDay,
    };

    const result = await this.prisma.userStats.upsert({
      where: {
        userId_organizationId: { userId, organizationId },
      },
      create: data,
      update: data,
    });

    this.logger.log(
      `StatsService.rebuild: userId=${userId} orgId=${organizationId} totalExp=${profile.totalExp}`,
    );

    return result as UserStatsRow;
  }

  private startOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay(); // 0=Sun, 1=Mon...
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    return new Date(d.setDate(diff));
  }
}
