import { describe, expect, it } from 'vitest';

import { WIRE_EVENTS } from './realtime';
import type { LevelUpPayload, AchievementUnlockedPayload, StatsUpdatedPayload, WireEventPayloadMap } from './realtime';

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

  it('has exactly three keys', () => {
    expect(Object.keys(WIRE_EVENTS)).toHaveLength(3);
  });

  it('values are string literals (const-as-const)', () => {
    const keys: (keyof typeof WIRE_EVENTS)[] = ['LEVEL_UP', 'ACHIEVEMENT_UNLOCKED', 'STATS_UPDATED'];
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
    };

    expect(map[WIRE_EVENTS.LEVEL_UP].newLevel).toBe(2);
    expect(map[WIRE_EVENTS.ACHIEVEMENT_UNLOCKED].code).toBe('X');
    expect(map[WIRE_EVENTS.STATS_UPDATED]).toStrictEqual({});
  });
});
