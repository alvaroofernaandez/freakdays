import { Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';
import { EVENT_TYPES, type EventType } from '../../events/event-types';
import type { DomainEvent } from '../../events/event.types';
import type { DomainEventHandler } from '../../events/interfaces/domain-event-handler.interface';
import { StatsService } from './stats.service';

@Injectable()
export class StatsProjectorHandler implements DomainEventHandler {
  readonly name = 'stats-projector';
  readonly handles: readonly EventType[] = [
    EVENT_TYPES.QUEST_COMPLETED,
    EVENT_TYPES.WORKOUT_LOGGED,
    EVENT_TYPES.ANIME_PROGRESSED,
    EVENT_TYPES.ANIME_COMPLETED,
    EVENT_TYPES.MANGA_PROGRESSED,
    EVENT_TYPES.DAILY_LOGIN,
    EVENT_TYPES.LEVEL_UP,
    EVENT_TYPES.ACHIEVEMENT_UNLOCKED,
  ] as const;

  private readonly logger = new Logger(StatsProjectorHandler.name);

  constructor(
    private readonly _prisma: PrismaService,
    private readonly statsService: StatsService,
  ) {}

  async handle(event: DomainEvent, _tx: Prisma.TransactionClient): Promise<void> {
    const userId = this.extractUserId(event);
    const orgId = event.orgId ?? '';

    if (!userId) {
      this.logger.warn(`StatsProjectorHandler: cannot extract userId for event ${event.eventId}`);
      return;
    }

    await this.statsService.rebuild(userId, orgId);

    this.logger.log(
      `StatsProjectorHandler: rebuilt stats for userId=${userId} orgId=${orgId} event=${event.type}`,
    );
  }

  private extractUserId(event: DomainEvent): string | null {
    if (typeof event.payload === 'object' && event.payload !== null && 'userId' in event.payload) {
      const userId = (event.payload as { userId: string }).userId;
      return typeof userId === 'string' ? userId : null;
    }
    return null;
  }
}
