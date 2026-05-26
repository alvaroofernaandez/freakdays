import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { CommonModule } from '../common/common.module';
import { PrismaService } from '../common/prisma/prisma.service';
import { EventsModule } from '../events/events.module';
import { DOMAIN_EVENT_HANDLERS } from '../events/events.constants';
import { RealtimeModule } from '../realtime/realtime.module';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { RealtimePushHandler } from '../realtime/realtime-push.handler';
import { AchievementEvaluationHandler } from './achievements/achievement-evaluation.handler';
import { ACHIEVEMENT_CATALOG } from './achievements/catalog';
import { FeedProjectorHandler } from './feed/feed-projector.handler';
import { ProgressionHandler } from './handlers/progression.handler';
import { StreakHandler } from './handlers/streak.handler';
import { StatsController } from './stats/stats.controller';
import { StatsProjectorHandler } from './stats/stats-projector.handler';
import { StatsRolloverService } from './stats/stats-rollover.service';
import { StatsService } from './stats/stats.service';
import { LeaderboardProjectorHandler } from './leaderboard/leaderboard-projector.handler';
import { LeaderboardSnapshotService } from './leaderboard/leaderboard-snapshot.service';

/**
 * GamificationModule owns all domain-event handlers.
 * It provides DOMAIN_EVENT_HANDLERS so the DomainEventsProcessor
 * (in EventsModule) can fan out to all registered handlers.
 *
 * Import order in AppModule: EventsModule BEFORE GamificationModule,
 * so the processor resolves the token from this module's provider.
 */
@Module({
  imports: [CommonModule, EventsModule, RealtimeModule, ScheduleModule.forRoot()],
  controllers: [StatsController],
  providers: [
    ProgressionHandler,
    StreakHandler,
    AchievementEvaluationHandler,
    StatsService,
    StatsProjectorHandler,
    StatsRolloverService,
    FeedProjectorHandler,
    LeaderboardProjectorHandler,
    LeaderboardSnapshotService,
    {
      provide: DOMAIN_EVENT_HANDLERS,
      // Handler order matters:
      // 1. StreakHandler — updates streak first so ProgressionHandler reads the updated value
      // 2. ProgressionHandler — reads streak for bonus calculation
      // 3. AchievementEvaluationHandler — evaluates achievements after progression
      // 4. StatsProjectorHandler — rebuilds stats read model
      // 5. FeedProjectorHandler — fan-out feed entries after progression data is settled
      // 6. LeaderboardProjectorHandler — marks dirty after stats are settled
      // 7. RealtimePushHandler (LAST) — emits post-commit; stats are already up to date
      useFactory: (
        streak: StreakHandler,
        progression: ProgressionHandler,
        achievement: AchievementEvaluationHandler,
        statsProjector: StatsProjectorHandler,
        feedProjector: FeedProjectorHandler,
        leaderboardProjector: LeaderboardProjectorHandler,
        realtimePush: RealtimePushHandler,
      ) => [
        streak,
        progression,
        achievement,
        statsProjector,
        feedProjector,
        leaderboardProjector,
        realtimePush,
      ],
      inject: [
        StreakHandler,
        ProgressionHandler,
        AchievementEvaluationHandler,
        StatsProjectorHandler,
        FeedProjectorHandler,
        LeaderboardProjectorHandler,
        RealtimePushHandler,
      ],
    },
  ],
  exports: [],
})
export class GamificationModule implements OnModuleInit {
  private readonly logger = new Logger(GamificationModule.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await this.seedAchievements();
  }

  private async seedAchievements(): Promise<void> {
    for (const seed of ACHIEVEMENT_CATALOG) {
      await this.prisma.achievement.upsert({
        where: { code: seed.code },
        create: {
          code: seed.code,
          name: seed.name,
          description: seed.description,
          triggers: seed.triggers,
          condition: seed.condition as never,
          active: true,
        },
        update: {
          name: seed.name,
          description: seed.description,
          triggers: seed.triggers,
          condition: seed.condition as never,
        },
      });
    }
    this.logger.log(`GamificationModule: seeded ${ACHIEVEMENT_CATALOG.length} achievements`);
  }
}
