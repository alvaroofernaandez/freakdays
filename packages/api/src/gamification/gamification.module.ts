import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { CommonModule } from '../common/common.module';
import { PrismaService } from '../common/prisma/prisma.service';
import { EventsModule } from '../events/events.module';
import { DOMAIN_EVENT_HANDLERS } from '../events/events.constants';
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
  imports: [CommonModule, EventsModule, ScheduleModule.forRoot()],
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
      // StreakHandler MUST precede ProgressionHandler so the streak is already
      // committed to the DB when ProgressionHandler reads currentStreak for the
      // bonus calculation (each handler runs in its own transaction).
      useFactory: (
        streak: StreakHandler,
        progression: ProgressionHandler,
        achievement: AchievementEvaluationHandler,
        statsProjector: StatsProjectorHandler,
      ) => [streak, progression, achievement, statsProjector],
      inject: [
        StreakHandler,
        ProgressionHandler,
        AchievementEvaluationHandler,
        StatsProjectorHandler,
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
