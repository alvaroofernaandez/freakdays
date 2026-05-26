import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PrismaService } from '../../common/prisma/prisma.service';
import { StatsService } from './stats.service';

/**
 * StatsRolloverService runs a daily cron job that rebuilds UserStats
 * for all active users who have a stats row. This ensures stats are
 * never stale for more than 24h, even if event-driven projection misses
 * an edge case.
 */
@Injectable()
export class StatsRolloverService {
  private readonly logger = new Logger(StatsRolloverService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly statsService: StatsService,
  ) {}

  /**
   * Runs at midnight UTC every day.
   * Rebuilds all existing UserStats rows from source-of-truth tables.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async rollover(): Promise<void> {
    this.logger.log('StatsRolloverService: starting daily rollover');

    const rows = await this.prisma.userStats.findMany({
      select: { userId: true, organizationId: true },
    });

    let rebuilt = 0;
    let errors = 0;

    for (const row of rows) {
      try {
        await this.statsService.rebuild(row.userId, row.organizationId);
        rebuilt++;
      } catch (err) {
        this.logger.error(
          `StatsRolloverService: failed to rebuild userId=${row.userId} orgId=${row.organizationId}`,
          err,
        );
        errors++;
      }
    }

    this.logger.log(
      `StatsRolloverService: rollover complete — rebuilt=${rebuilt}, errors=${errors}`,
    );
  }
}
