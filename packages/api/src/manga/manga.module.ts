import { Module } from '@nestjs/common';

import { CommonModule } from '../common/common.module';
import { EventsModule } from '../events/events.module';
import { MangaController } from './manga.controller';
import { MangaService } from './manga.service';

@Module({
  imports: [CommonModule, EventsModule],
  controllers: [MangaController],
  providers: [MangaService],
})
export class MangaModule {}
