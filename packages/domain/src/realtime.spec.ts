import { describe, expect, it } from 'vitest';

import { WIRE_EVENTS } from './realtime';
import type { LevelUpPayload, AchievementUnlockedPayload, StatsUpdatedPayload, FeedEntryAddedPayload, WireEventPayloadMap } from './realtime';

describe('WIRE_EVENTS', () => {
  it('has level_up key with value "level_up"', () => {
    expect(WIRE_EVENTS.LEVEL_UP).toBe('level_up');
  });

  it('has achievement_unlocked key with value "achievement_unlocked"', () => {
    expect(WIRE_EVENTS.ACHIEVEMENT_UNLOCKED).toBe('achievement_unlocked');
  });

  it('has stats_updated key with value "stats_updated"', () => {
    expect(WIRE_EVENTS.STATS_UPDATED).toBe('stats_updated');
  });

  it('has FEED_ENTRY_ADDED key with value "feed_entry_added"', () => {
    expect(WIRE_EVENTS.FEED_ENTRY_ADDED).toBe('feed_entry_added');
  });

  it('has exactly five keys (four original + PRESENCE_CHANGED added in PR2)', () => {
    expect(Object.keys(WIRE_EVENTS)).toHaveLength(5);
  });

  it('values are string literals (const-as-const)', () => {
    const keys: (keyof typeof WIRE_EVENTS)[] = ['LEVEL_UP', 'ACHIEVEMENT_UNLOCKED', 'STATS_UPDATED', 'FEED_ENTRY_ADDED', 'PRESENCE_CHANGED'];
    for (const key of keys) {
      expect(typeof WIRE_EVENTS[key]).toBe('string');
    }
  });
});

describe('Payload interfaces (compile-time contracts)', () => {
  it('LevelUpPayload satisfies required shape', () => {
    const payload = {
      previousLevel: 1,
      newLevel: 2,
      totalExp: 150,
    } satisfies LevelUpPayload;

    expect(payload.previousLevel).toBe(1);
    expect(payload.newLevel).toBe(2);
    expect(payload.totalExp).toBe(150);
  });

  it('AchievementUnlockedPayload satisfies required shape (no iconKey)', () => {
    const payload = {
      code: 'FIRST_GOAL',
      name: 'First Goal',
      description: 'Complete your first quest',
    } satisfies AchievementUnlockedPayload;

    expect(payload.code).toBe('FIRST_GOAL');
    expect(payload.name).toBe('First Goal');
    expect(payload.iconKey).toBeUndefined();
  });

  it('AchievementUnlockedPayload satisfies required shape (with iconKey)', () => {
    const payload = {
      code: 'FIRST_GOAL',
      name: 'First Goal',
      description: 'Complete your first quest',
      iconKey: 'trophy',
    } satisfies AchievementUnlockedPayload;

    expect(payload.iconKey).toBe('trophy');
  });

  it('StatsUpdatedPayload satisfies empty shape', () => {
    const payload = {} satisfies StatsUpdatedPayload;
    expect(payload).toBeDefined();
  });

  it('WireEventPayloadMap keys match WIRE_EVENTS values', () => {
    const map: WireEventPayloadMap = {
      level_up: { previousLevel: 1, newLevel: 2, totalExp: 100 },
      achievement_unlocked: { code: 'X', name: 'Y', description: 'Z' },
      stats_updated: {},
      feed_entry_added: {
        id: 'fe-1',
        partyId: 'p-1',
        type: 'level.up',
        actorUserId: 'u-1',
        actorName: 'Alice',
        payload: {},
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    };

    expect(map[WIRE_EVENTS.LEVEL_UP].newLevel).toBe(2);
    expect(map[WIRE_EVENTS.ACHIEVEMENT_UNLOCKED].code).toBe('X');
    expect(map[WIRE_EVENTS.STATS_UPDATED]).toStrictEqual({});
    expect(map[WIRE_EVENTS.FEED_ENTRY_ADDED].type).toBe('level.up');
  });
});

describe('FeedEntryAddedPayload (compile-time contract)', () => {
  it('FeedEntryAddedPayload satisfies required shape', () => {
    const payload = {
      id: 'fe-1',
      partyId: 'p-1',
      type: 'level.up',
      actorUserId: 'u-1',
      actorName: null,
      payload: { newLevel: 2 },
      createdAt: '2026-01-01T00:00:00.000Z',
    } satisfies FeedEntryAddedPayload;

    expect(payload.id).toBe('fe-1');
    expect(payload.actorName).toBeNull();
  });
});

describe('PRESENCE_CHANGED wire event (PR2)', () => {
  it('WIRE_EVENTS.PRESENCE_CHANGED === "presence_changed"', () => {
    expect(WIRE_EVENTS.PRESENCE_CHANGED).toBe('presence_changed');
  });

  it('has exactly five keys after PR2 addition', () => {
    expect(Object.keys(WIRE_EVENTS)).toHaveLength(5);
  });

  it('PresenceChangedPayload satisfies required shape (online)', () => {
    const payload = {
      userId: 'user-abc',
      online: true,
      at: '2026-05-26T10:00:00.000Z',
    } satisfies import('./realtime').PresenceChangedPayload;

    expect(payload.userId).toBe('user-abc');
    expect(payload.online).toBe(true);
    expect(typeof payload.at).toBe('string');
  });

  it('PresenceChangedPayload satisfies required shape (offline)', () => {
    const payload = {
      userId: 'user-xyz',
      online: false,
      at: '2026-05-26T10:01:00.000Z',
    } satisfies import('./realtime').PresenceChangedPayload;

    expect(payload.online).toBe(false);
  });

  it('WireEventPayloadMap includes presence_changed key with correct shape', () => {
    const map: import('./realtime').WireEventPayloadMap = {
      level_up: { previousLevel: 1, newLevel: 2, totalExp: 100 },
      achievement_unlocked: { code: 'X', name: 'Y', description: 'Z' },
      stats_updated: {},
      feed_entry_added: {
        id: 'fe-1',
        partyId: 'p-1',
        type: 'level.up',
        actorUserId: 'u-1',
        actorName: 'Alice',
        payload: {},
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      presence_changed: {
        userId: 'u-1',
        online: true,
        at: '2026-01-01T00:00:00.000Z',
      },
    };

    expect(map[WIRE_EVENTS.PRESENCE_CHANGED].userId).toBe('u-1');
    expect(map[WIRE_EVENTS.PRESENCE_CHANGED].online).toBe(true);
  });
});
