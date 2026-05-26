import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';

import { AuthModule } from './auth/auth.module';
import { CalendarModule } from './calendar/calendar.module';
import { EventsModule } from './events/events.module';
import { ClerkJwtGuard } from './auth/guards/clerk-jwt.guard';
import { CommonModule } from './common/common.module';
import { validateEnv } from './common/config/env.schema';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { OrgContextGuard } from './common/guards/org-context.guard';
import { RequestContextInterceptor } from './common/interceptors/request-context.interceptor';
import { HealthModule } from './health/health.module';
import { MangaModule } from './manga/manga.module';
import { ModulesModule } from './modules/modules.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { PartyModule } from './party/party.module';
import { PartyListsModule } from './party-lists/party-lists.module';
import { ProfileModule } from './profile/profile.module';
import { QuestsNotificationsModule } from './quests-notifications/quests-notifications.module';
import { QuestsModule } from './quests/quests.module';
import { StorageModule } from './storage/storage.module';
import { UsersModule } from './users/users.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { AnimeModule } from './anime/anime.module';
import { FeedModule } from './feed/feed.module';
import { GamificationModule } from './gamification/gamification.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { RealtimeModule } from './realtime/realtime.module';
import { WorkoutsModule } from './workouts/workouts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'prod'
            ? { target: 'pino-pretty', options: { colorize: true, singleLine: true } }
            : undefined,
        redact: ['req.headers.authorization', 'req.headers.cookie'],
        customLogLevel: (_req, res) => {
          if (res.statusCode >= 500) return 'error';
          if (res.statusCode >= 400) return 'warn';
          return 'info';
        },
        genReqId: (req) => {
          const existing = req.headers['x-request-id'];
          if (typeof existing === 'string' && existing.length > 0) return existing;
          if (Array.isArray(existing) && existing[0]) return existing[0];
          return crypto.randomUUID();
        },
      },
    }),
    CommonModule,
    EventsModule,
    FeedModule,
    GamificationModule,
    LeaderboardModule,
    RealtimeModule,
    AuthModule,
    CalendarModule,
    AnimeModule,
    HealthModule,
    MangaModule,
    ModulesModule,
    OrganizationsModule,
    PartyModule,
    PartyListsModule,
    StorageModule,
    ProfileModule,
    QuestsModule,
    QuestsNotificationsModule,
    WorkoutsModule,
    UsersModule,
    WebhooksModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestContextInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ClerkJwtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: OrgContextGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
