/**
 * Real-time wire-event contracts for FreakDays push notifications.
 * Plain TypeScript interfaces only — NO zod, NO runtime dependencies.
 * Used by both the API (event emitter) and the web client (event consumer).
 */

export const WIRE_EVENTS = {
  LEVEL_UP: 'level_up',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  STATS_UPDATED: 'stats_updated',
} as const;

export type WireEventName = (typeof WIRE_EVENTS)[keyof typeof WIRE_EVENTS];

export interface LevelUpPayload {
  readonly previousLevel: number;
  readonly newLevel: number;
  readonly totalExp: number;
}

export interface AchievementUnlockedPayload {
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly iconKey?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface StatsUpdatedPayload {}

export interface WireEventPayloadMap {
  readonly level_up: LevelUpPayload;
  readonly achievement_unlocked: AchievementUnlockedPayload;
  readonly stats_updated: StatsUpdatedPayload;
}
