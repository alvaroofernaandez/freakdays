import { Module } from '@nestjs/common';

import { CommonModule } from '../common/common.module';
import { EventsModule } from '../events/events.module';
import { AnimeController } from './anime.controller';
import { AnimeService } from './anime.service';

@Module({
  imports: [CommonModule, EventsModule],
  controllers: [AnimeController],
  providers: [AnimeService],
})
export class AnimeModule {}
