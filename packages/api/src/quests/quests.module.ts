import { Module } from '@nestjs/common';

import { CommonModule } from '../common/common.module';
import { EventsModule } from '../events/events.module';
import { QuestsController } from './quests.controller';
import { QuestsService } from './quests.service';

@Module({
  imports: [CommonModule, EventsModule],
  controllers: [QuestsController],
  providers: [QuestsService],
})
export class QuestsModule {}
