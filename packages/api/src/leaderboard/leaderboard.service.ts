import { ForbiddenException, Injectable } from '@nestjs/common';

import { PrismaService } from '../common/prisma/prisma.service';

export interface LeaderboardRow {
  readonly rank: number;
  readonly userId: string;
  readonly displayName: string | null;
  readonly avatarUrl: string | null;
  readonly totalExp: number;
  readonly level: number;
  readonly currentStreak: number;
  readonly isCurrentUser: boolean;
}

export interface LeaderboardPage {
  readonly items: LeaderboardRow[];
  readonly yourRank: number | null;
  readonly total: number;
  readonly page: number;
}

type ProfileLike = {
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  totalExp: number;
  level: number;
  currentStreak: number;
};

/** Sort comparator: totalExp DESC → level DESC → currentStreak DESC → userId ASC */
function rankComparator(a: ProfileLike, b: ProfileLike): number {
  if (b.totalExp !== a.totalExp) return b.totalExp - a.totalExp;
  if (b.level !== a.level) return b.level - a.level;
  if (b.currentStreak !== a.currentStreak) return b.currentStreak - a.currentStreak;
  return a.userId < b.userId ? -1 : a.userId > b.userId ? 1 : 0;
}

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getPartyLeaderboard(
    partyId: string,
    userId: string,
    page: number,
    limit: number,
  ): Promise<LeaderboardPage> {
    // Verify membership
    const membership = await this.prisma.partyMember.findUnique({
      where: { partyId_userId: { partyId, userId } },
    });

    if (!membership) {
      throw new ForbiddenException('No tienes acceso al leaderboard de esta party');
    }

    // Load all members with profiles (party is small ≤ maxMembers)
    const members = await this.prisma.partyMember.findMany({
      where: { partyId },
      include: {
        user: {
          select: {
            id: true,
            profile: {
              select: {
                userId: true,
                displayName: true,
                avatarUrl: true,
                totalExp: true,
                level: true,
                currentStreak: true,
              },
            },
          },
        },
      },
    });

    // Flatten and sort
    const profiles = members
      .map((m) => m.user.profile)
      .filter((p): p is NonNullable<typeof p> => p !== null);

    const sorted = [...profiles].sort(rankComparator);
    const total = sorted.length;

    // Compute yourRank (1-based position in the full sorted set)
    const yourRankIndex = sorted.findIndex((p) => p.userId === userId);
    const yourRank = yourRankIndex >= 0 ? yourRankIndex + 1 : null;

    // Paginate
    const offset = (page - 1) * limit;
    const pageItems = sorted.slice(offset, offset + limit);

    const items: LeaderboardRow[] = pageItems.map((p, i) => ({
      rank: offset + i + 1,
      userId: p.userId,
      displayName: p.displayName,
      avatarUrl: p.avatarUrl,
      totalExp: p.totalExp,
      level: p.level,
      currentStreak: p.currentStreak,
      isCurrentUser: p.userId === userId,
    }));

    return { items, yourRank, total, page };
  }

  async getGlobalLeaderboard(
    callerUserId: string,
    page: number,
    limit: number,
  ): Promise<LeaderboardPage> {
    const offset = (page - 1) * limit;

    // Determine whether the snapshot is populated (cold-start guard)
    const snapshotCount = await this.prisma.leaderboardSnapshotEntry.count();

    if (snapshotCount === 0) {
      // Cold-start fallback: snapshot not yet populated by the cron.
      // Falls back to the live Profile query once; switches to snapshot on the
      // next cron tick. Safe to remove after first successful cron run in prod.
      return this.legacyGlobalLeaderboard(callerUserId, page, limit);
    }

    // Hot path: read from the materialized snapshot.
    // Reuse snapshotCount from the cold-start guard above — no second count() call.
    const total = snapshotCount;
    const snapshotEntries = await this.prisma.leaderboardSnapshotEntry.findMany({
      orderBy: { rank: 'asc' },
      skip: offset,
      take: limit,
    });

    // yourRank: O(1) PK lookup — eliminates the previous O(N) OR-count
    const callerEntry = await this.prisma.leaderboardSnapshotEntry.findUnique({
      where: { userId: callerUserId },
      select: { rank: true },
    });
    const yourRank: number | null = callerEntry?.rank ?? null;

    const items: LeaderboardRow[] = snapshotEntries.map((e) => ({
      rank: e.rank,
      userId: e.userId,
      displayName: e.displayName,
      avatarUrl: e.avatarUrl,
      totalExp: e.totalExp,
      level: e.level,
      currentStreak: e.currentStreak,
      isCurrentUser: e.userId === callerUserId,
    }));

    return { items, yourRank, total, page };
  }

  /**
   * Legacy live-query fallback. Used only on cold start (snapshot not yet built).
   * Preserved as a private method; removed in a future cleanup once the cron has
   * run at least once on every environment.
   */
  private async legacyGlobalLeaderboard(
    callerUserId: string,
    page: number,
    limit: number,
  ): Promise<LeaderboardPage> {
    const offset = (page - 1) * limit;

    const [profiles, total] = await Promise.all([
      this.prisma.profile.findMany({
        where: { leaderboardOptIn: true },
        orderBy: [
          { totalExp: 'desc' },
          { level: 'desc' },
          { currentStreak: 'desc' },
          { userId: 'asc' },
        ],
        select: {
          userId: true,
          displayName: true,
          avatarUrl: true,
          totalExp: true,
          level: true,
          currentStreak: true,
        },
        skip: offset,
        take: limit,
      }),
      this.prisma.profile.count({ where: { leaderboardOptIn: true } }),
    ]);

    const callerProfile = await this.prisma.profile.findUnique({
      where: { userId: callerUserId },
      select: { leaderboardOptIn: true, totalExp: true, level: true, currentStreak: true },
    });

    let yourRank: number | null = null;

    if (callerProfile?.leaderboardOptIn) {
      const rankedAbove = await this.prisma.profile.count({
        where: {
          leaderboardOptIn: true,
          OR: [
            { totalExp: { gt: callerProfile.totalExp } },
            {
              totalExp: callerProfile.totalExp,
              level: { gt: callerProfile.level },
            },
            {
              totalExp: callerProfile.totalExp,
              level: callerProfile.level,
              currentStreak: { gt: callerProfile.currentStreak },
            },
            {
              totalExp: callerProfile.totalExp,
              level: callerProfile.level,
              currentStreak: callerProfile.currentStreak,
              userId: { lt: callerUserId },
            },
          ],
        },
      });
      yourRank = rankedAbove + 1;
    }

    const items: LeaderboardRow[] = profiles.map((p, i) => ({
      rank: offset + i + 1,
      userId: p.userId,
      displayName: p.displayName,
      avatarUrl: p.avatarUrl,
      totalExp: p.totalExp,
      level: p.level,
      currentStreak: p.currentStreak,
      isCurrentUser: p.userId === callerUserId,
    }));

    return { items, yourRank, total, page };
  }
}
