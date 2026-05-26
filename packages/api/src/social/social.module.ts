import { Module } from '@nestjs/common';

import { CommonModule } from '../common/common.module';
import { PresenceService } from '../realtime/presence.service';
import { FriendshipController } from './friendship.controller';
import { FriendshipService } from './friendship.service';

@Module({
  imports: [CommonModule],
  controllers: [FriendshipController],
  providers: [FriendshipService, PresenceService],
  exports: [FriendshipService, PresenceService],
})
export class SocialModule {}
