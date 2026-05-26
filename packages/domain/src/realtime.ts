/**
 * Real-time wire-event contracts for FreakDays push notifications.
 * Plain TypeScript interfaces only — NO zod, NO runtime dependencies.
 * Used by both the API (event emitter) and the web client (event consumer).
 */

export const WIRE_EVENTS = {
  LEVEL_UP: 'level_up',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  STATS_UPDATED: 'stats_updated',
  FEED_ENTRY_ADDED: 'feed_entry_added',
  PRESENCE_CHANGED: 'presence_changed',
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

export interface FeedEntryAddedPayload {
  readonly id: string;
  readonly partyId: string;
  readonly type: string;
  readonly actorUserId: string;
  readonly actorName: string | null;
  readonly payload: Record<string, unknown>;
  readonly createdAt: string;
}

export interface PresenceChangedPayload {
  readonly userId: string;
  readonly online: boolean;
  readonly at: string; // ISO 8601
}

export interface WireEventPayloadMap {
  readonly level_up: LevelUpPayload;
  readonly achievement_unlocked: AchievementUnlockedPayload;
  readonly stats_updated: StatsUpdatedPayload;
  readonly feed_entry_added: FeedEntryAddedPayload;
  readonly presence_changed: PresenceChangedPayload;
}
