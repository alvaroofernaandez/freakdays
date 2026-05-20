import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AuthModule } from './auth/auth.module';
import { CalendarModule } from './calendar/calendar.module';
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
    CommonModule,
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
