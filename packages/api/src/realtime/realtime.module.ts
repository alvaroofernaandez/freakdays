import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';
import { EventsModule } from '../events/events.module';
import { SocialModule } from '../social/social.module';
import { PresenceService } from './presence.service';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimePushHandler } from './realtime-push.handler';

/**
 * RealtimeModule owns the Socket.IO WebSocketGateway and the push handler.
 *
 * PR2 additions:
 *  - PresenceService tracks per-user Redis presence (multi-socket ref-counting).
 *  - SocialModule is imported to inject FriendshipService into the gateway so
 *    it can resolve accepted-friend rooms for PRESENCE_CHANGED emissions.
 *
 * It does NOT provide DOMAIN_EVENT_HANDLERS to avoid last-wins clobbering
 * with GamificationModule's authoritative provider. Instead, it exports
 * RealtimePushHandler so GamificationModule can inject it into its existing
 * useFactory array as the last handler.
 *
 * CommonModule provides PrismaService, which the RealtimeGateway uses to
 * join party rooms on socket connect (server-side membership verification).
 */
@Module({
  imports: [AuthModule, EventsModule, CommonModule, SocialModule],
  providers: [RealtimeGateway, RealtimePushHandler, PresenceService],
  exports: [RealtimeGateway, RealtimePushHandler, PresenceService],
})
export class RealtimeModule {}
