import type { EventType } from './event-types';

export interface DomainEvent<TPayload = unknown> {
  readonly eventId: string;
  readonly type: EventType;
  readonly aggregateId: string;
  readonly orgId: string | null;
  readonly payload: TPayload;
  readonly occurredAt: Date;
}

export interface QuestCompletedPayload {
  readonly questId: string;
  readonly userId: string;
  readonly expAwarded: number;
  readonly level: number;
}

export interface WorkoutLoggedPayload {
  readonly userId: string;
  readonly orgId: string;
  readonly workoutId: string;
  readonly loggedAt: Date;
}

export interface AnimeProgressedPayload {
  readonly userId: string;
  readonly orgId: string;
  readonly animeId: string;
  readonly episodeNumber: number;
  readonly progressedAt: Date;
}

export interface AnimeCompletedPayload {
  readonly userId: string;
  readonly orgId: string;
  readonly animeId: string;
  readonly completedAt: Date;
}

export interface MangaProgressedPayload {
  readonly userId: string;
  readonly orgId: string;
  readonly mangaId: string;
  readonly chaptersRead: number;
  readonly progressedAt: Date;
}

export interface DailyLoginPayload {
  readonly userId: string;
  readonly orgId: string;
  readonly loginDate: string; // ISO calendar day e.g. "2026-01-02"
}

export interface LevelUpPayload {
  readonly userId: string;
  readonly orgId: string;
  readonly previousLevel: number;
  readonly newLevel: number;
  readonly totalExp: number;
}

export interface AchievementUnlockedPayload {
  readonly userId: string;
  readonly orgId: string;
  readonly achievementCode: string;
  readonly unlockedAt: Date;
}
