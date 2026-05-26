import { Module } from '@nestjs/common';

import { CommonModule } from '../common/common.module';
import { SocialModule } from '../social/social.module';
import { FeedController } from './feed.controller';
import { FriendFeedController } from './friend-feed.controller';
import { FeedService } from './feed.service';

@Module({
  imports: [CommonModule, SocialModule],
  controllers: [FeedController, FriendFeedController],
  providers: [FeedService],
  exports: [FeedService],
})
export class FeedModule {}
