import { Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../../common/prisma/prisma.service';
import { EVENT_TYPES, type EventType } from '../../events/event-types';
import type { DomainEvent } from '../../events/event.types';
import type { DomainEventHandler } from '../../events/interfaces/domain-event-handler.interface';

type QualifyingPayload = { userId: string };

/**
 * Returns the UTC calendar day string (YYYY-MM-DD) for a given Date.
 */
function toCalendarDay(date: Date): string {
  return date.toISOString().split('T')[0] ?? '';
}

/**
 * Returns the number of calendar days between two dates (UTC).
 * Positive means `b` is later than `a`.
 */
function calendarDayDiff(a: Date, b: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const aDay = Math.floor(a.getTime() / msPerDay);
  const bDay = Math.floor(b.getTime() / msPerDay);
  return bDay - aDay;
}

@Injectable()
export class StreakHandler implements DomainEventHandler {
  readonly name = 'streak';
  readonly handles: readonly EventType[] = [
    EVENT_TYPES.QUEST_COMPLETED,
    EVENT_TYPES.WORKOUT_LOGGED,
    EVENT_TYPES.ANIME_PROGRESSED,
    EVENT_TYPES.ANIME_COMPLETED,
    EVENT_TYPES.MANGA_PROGRESSED,
    EVENT_TYPES.DAILY_LOGIN,
  ] as const;

  private readonly logger = new Logger(StreakHandler.name);

  constructor(private readonly _prisma: PrismaService) {}

  async handle(event: DomainEvent<QualifyingPayload>, tx: Prisma.TransactionClient): Promise<void> {
    const userId = (event.payload as QualifyingPayload).userId;

    if (!userId) {
      this.logger.warn(`StreakHandler: missing userId for event ${event.eventId}`);
      return;
    }

    const profile = await tx.profile.findUnique({
      where: { userId },
      select: {
        id: true,
        currentStreak: true,
        longestStreak: true,
        lastActivityDate: true,
      },
    });

    if (!profile) {
      this.logger.warn(`StreakHandler: no profile for userId=${userId}`);
      return;
    }

    const eventDay = toCalendarDay(event.occurredAt);

    // First ever activity
    if (!profile.lastActivityDate) {
      const newLongest = Math.max(profile.longestStreak, 1);
      await tx.profile.update({
        where: { id: profile.id },
        data: {
          currentStreak: 1,
          longestStreak: newLongest,
          lastActivityDate: event.occurredAt,
        },
      });
      this.logger.log(`StreakHandler: userId=${userId} first activity, streak=1`);
      return;
    }

    const lastDay = toCalendarDay(profile.lastActivityDate);

    // Same day — idempotent, no change
    if (eventDay === lastDay) {
      this.logger.log(`StreakHandler: userId=${userId} same-day activity, streak unchanged`);
      return;
    }

    const diff = calendarDayDiff(profile.lastActivityDate, event.occurredAt);
    let newStreak: number;

    if (diff === 1) {
      // Consecutive day — increment
      newStreak = profile.currentStreak + 1;
    } else {
      // Gap > 1 day — reset
      newStreak = 1;
    }

    const newLongest = Math.max(profile.longestStreak, newStreak);

    await tx.profile.update({
      where: { id: profile.id },
      data: {
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastActivityDate: event.occurredAt,
      },
    });

    this.logger.log(`StreakHandler: userId=${userId} streak=${newStreak} longest=${newLongest}`);
  }
}
