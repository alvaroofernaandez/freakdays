import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PrismaService } from '../../common/prisma/prisma.service';
import { assignRanks } from './assign-ranks';

@Injectable()
export class LeaderboardSnapshotService {
  private readonly logger = new Logger(LeaderboardSnapshotService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Refreshes the leaderboard snapshot every 5 minutes.
   *
   * Strategy: full recompute on any dirty user.
   * Rationale: rank is global — a single user's EXP change shifts every other
   * user's rank. A partial recompute would produce incorrect ranks. The snapshot
   * exists precisely to move this O(N) cost off the hot read path.
   *
   * ScheduleModule.forRoot() is in GamificationModule — no second registration.
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async refresh(): Promise<void> {
    // Step 1: read dirty set — snapshot which ids are dirty NOW
    const dirtyRows = await this.prisma.dirtyLeaderboardUser.findMany();

    if (dirtyRows.length === 0) {
      return; // no-op — nothing changed since last run
    }

    const dirtyIds = dirtyRows.map((r) => r.userId);

    this.logger.log(
      `LeaderboardSnapshotService: ${dirtyIds.length} dirty user(s) — recomputing global ranks`,
    );

    // Step 2: load all opted-in profiles ordered by the multi-field tiebreak
    // (ORDER BY mirrors assignRanks comparator — avoids double-sort cost)
    const profiles = await this.prisma.profile.findMany({
      where: { leaderboardOptIn: true },
      orderBy: [
        { totalExp: 'desc' },
        { level: 'desc' },
        { currentStreak: 'desc' },
        { userId: 'asc' },
      ],
      select: {
        userId: true,
        totalExp: true,
        level: true,
        currentStreak: true,
        displayName: true,
        avatarUrl: true,
      },
    });

    // Step 3: assign ranks using the pure function (preserves tiebreak)
    const ranked = assignRanks(profiles);
    const computedAt = new Date();

    // Step 4: materialize in a single transaction:
    //   - delete old snapshot (all rows)
    //   - recreate with new ranks
    //   - clear ONLY the dirty ids seen at step 1 (new dirty rows added during
    //     recompute survive to the next cron tick — no lost updates)
    await this.prisma.$transaction(async (tx) => {
      await tx.leaderboardSnapshotEntry.deleteMany({});

      await tx.leaderboardSnapshotEntry.createMany({
        data: ranked.map((r) => ({
          userId: r.userId,
          rank: r.rank,
          totalExp: r.totalExp,
          level: r.level,
          currentStreak: r.currentStreak,
          displayName: r.displayName,
          avatarUrl: r.avatarUrl,
          computedAt,
        })),
      });

      await tx.dirtyLeaderboardUser.deleteMany({
        where: { userId: { in: dirtyIds } },
      });
    });

    this.logger.log(
      `LeaderboardSnapshotService: snapshot refreshed — ${ranked.length} entries materialized`,
    );
  }
}
