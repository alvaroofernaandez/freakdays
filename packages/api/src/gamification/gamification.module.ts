import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { CommonModule } from '../common/common.module';
import { PrismaService } from '../common/prisma/prisma.service';
import { EventsModule } from '../events/events.module';
import { DOMAIN_EVENT_HANDLERS } from '../events/events.constants';
import { RealtimeModule } from '../realtime/realtime.module';
import { RealtimePushHandler } from '../realtime/realtime-push.handler';
import { AchievementEvaluationHandler } from './achievements/achievement-evaluation.handler';
import { ACHIEVEMENT_CATALOG } from './achievements/catalog';
import { ProgressionHandler } from './handlers/progression.handler';
import { StreakHandler } from './handlers/streak.handler';
import { StatsController } from './stats/stats.controller';
import { StatsProjectorHandler } from './stats/stats-projector.handler';
import { StatsRolloverService } from './stats/stats-rollover.service';
import { StatsService } from './stats/stats.service';

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
    {
      provide: DOMAIN_EVENT_HANDLERS,
      // Handler order matters:
      // 1. StreakHandler — updates streak first so ProgressionHandler reads the updated value
      // 2. ProgressionHandler — reads streak for bonus calculation
      // 3. AchievementEvaluationHandler — evaluates achievements after progression
      // 4. StatsProjectorHandler — rebuilds stats read model
      // 5. RealtimePushHandler (LAST) — emits post-commit; stats are already up to date
      useFactory: (
        streak: StreakHandler,
        progression: ProgressionHandler,
        achievement: AchievementEvaluationHandler,
        statsProjector: StatsProjectorHandler,
        realtimePush: RealtimePushHandler,
      ) => [streak, progression, achievement, statsProjector, realtimePush],
      inject: [
        StreakHandler,
        ProgressionHandler,
        AchievementEvaluationHandler,
        StatsProjectorHandler,
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
