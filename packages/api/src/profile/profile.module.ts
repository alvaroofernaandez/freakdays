import { Module } from '@nestjs/common';

import { CommonModule } from '../common/common.module';
import { EventsModule } from '../events/events.module';
import { StorageModule } from '../storage/storage.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [CommonModule, EventsModule, StorageModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
