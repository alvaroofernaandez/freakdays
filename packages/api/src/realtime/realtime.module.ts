import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';
import { EventsModule } from '../events/events.module';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimePushHandler } from './realtime-push.handler';

/**
 * RealtimeModule owns the Socket.IO WebSocketGateway and the push handler.
 * It does NOT provide DOMAIN_EVENT_HANDLERS to avoid last-wins clobbering
 * with GamificationModule's authoritative provider. Instead, it exports
 * RealtimePushHandler so GamificationModule can inject it into its existing
 * useFactory array as the last handler.
 *
 * CommonModule provides PrismaService, which the RealtimeGateway uses to
 * join party rooms on socket connect (server-side membership verification).
 */
@Module({
  imports: [AuthModule, EventsModule, CommonModule],
  providers: [RealtimeGateway, RealtimePushHandler],
  exports: [RealtimeGateway, RealtimePushHandler],
})
export class RealtimeModule {}
