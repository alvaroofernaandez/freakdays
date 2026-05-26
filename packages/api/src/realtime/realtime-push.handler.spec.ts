// Mock @freakdays/domain BEFORE any imports that pull it in
jest.mock('@freakdays/domain', () => ({
  WIRE_EVENTS: {
    LEVEL_UP: 'level_up',
    ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
    STATS_UPDATED: 'stats_updated',
  },
}));

// Mock gateway module to avoid jose ESM chain
jest.mock('./realtime.gateway', () => ({
  RealtimeGateway: jest.fn(),
}));

import { RealtimePushHandler } from './realtime-push.handler';
import { EVENT_TYPES } from '../events/event-types';
import type {
  DomainEvent,
  LevelUpPayload,
  AchievementUnlockedPayload,
} from '../events/event.types';
import { WIRE_EVENTS } from '@freakdays/domain';

interface MockGateway {
  emitToUser: jest.Mock;
}

const makeMockGateway = (): MockGateway => ({
  emitToUser: jest.fn(),
});

type DeferFn = (fn: () => void | Promise<void>) => void;

const collectDeferred = (): { defer: DeferFn; flush: () => Promise<void> } => {
  const fns: Array<() => void | Promise<void>> = [];
  const defer: DeferFn = (fn) => fns.push(fn);
  const flush = async () => {
    for (const fn of fns) await fn();
  };
  return { defer, flush };
};

const makeLevelUpEvent = (
  userId: string,
  previousLevel = 1,
  newLevel = 2,
  totalExp = 200,
): DomainEvent<LevelUpPayload> => ({
  eventId: `evt-levelup-${userId}`,
  type: EVENT_TYPES.LEVEL_UP,
  aggregateId: userId,
  orgId: null,
  payload: { userId, orgId: null as unknown as string, previousLevel, newLevel, totalExp },
  occurredAt: new Date(),
});

const makeAchievementEvent = (
  userId: string,
  achievementCode: string,
): DomainEvent<AchievementUnlockedPayload> => ({
  eventId: `evt-ach-${userId}`,
  type: EVENT_TYPES.ACHIEVEMENT_UNLOCKED,
  aggregateId: userId,
  orgId: null,
  payload: { userId, orgId: null as unknown as string, achievementCode, unlockedAt: new Date() },
  occurredAt: new Date(),
});

const makeProgressionEvent = (userId: string): DomainEvent => ({
  eventId: `evt-workout-${userId}`,
  type: EVENT_TYPES.WORKOUT_LOGGED,
  aggregateId: userId,
  orgId: null,
  payload: { userId, orgId: null, workoutId: 'w-1', loggedAt: new Date() },
  occurredAt: new Date(),
});

const makeTx = (
  achievementRow?: {
    code: string;
    name: string;
    description: string;
    iconKey: string | null;
  } | null,
) => ({
  achievement: {
    findUnique: jest
      .fn()
      .mockResolvedValue(
        achievementRow !== undefined
          ? achievementRow
          : {
              code: 'FIRST_GOAL',
              name: 'First Goal',
              description: 'Complete your first quest',
              iconKey: null,
            },
      ),
  },
});

describe('RealtimePushHandler', () => {
  let gateway: ReturnType<typeof makeMockGateway>;
  let handler: RealtimePushHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    gateway = makeMockGateway();
     
    handler = new RealtimePushHandler(gateway as any);
  });

  describe('name and handles', () => {
    it('has name realtime-push', () => {
      expect(handler.name).toBe('realtime-push');
    });

    it('handles all 8 event types', () => {
      expect(handler.handles).toContain(EVENT_TYPES.LEVEL_UP);
      expect(handler.handles).toContain(EVENT_TYPES.ACHIEVEMENT_UNLOCKED);
      expect(handler.handles).toContain(EVENT_TYPES.QUEST_COMPLETED);
      expect(handler.handles).toContain(EVENT_TYPES.WORKOUT_LOGGED);
      expect(handler.handles).toContain(EVENT_TYPES.ANIME_PROGRESSED);
      expect(handler.handles).toContain(EVENT_TYPES.ANIME_COMPLETED);
      expect(handler.handles).toContain(EVENT_TYPES.MANGA_PROGRESSED);
      expect(handler.handles).toContain(EVENT_TYPES.DAILY_LOGIN);
      expect(handler.handles).toHaveLength(8);
    });
  });

  describe('Test A: level.up → level_up + stats_updated after flush', () => {
    it('emits level_up and stats_updated for the correct userId after commit flush', async () => {
      const event = makeLevelUpEvent('user-a', 2, 3, 450);
      const tx = makeTx();
      const { defer, flush } = collectDeferred();

      await handler.handle(event, tx as never, defer);
      // Before flush, nothing emitted
      expect(gateway.emitToUser).not.toHaveBeenCalled();

      await flush();

      expect(gateway.emitToUser).toHaveBeenCalledWith('user-a', WIRE_EVENTS.LEVEL_UP, {
        previousLevel: 2,
        newLevel: 3,
        totalExp: 450,
      });
      expect(gateway.emitToUser).toHaveBeenCalledWith('user-a', WIRE_EVENTS.STATS_UPDATED, {});
      expect(gateway.emitToUser).toHaveBeenCalledTimes(2);
    });

    it('does NOT emit to userB when processing userA level_up (room isolation)', async () => {
      const event = makeLevelUpEvent('user-a', 2, 3, 450);
      const tx = makeTx();
      const { defer, flush } = collectDeferred();

      await handler.handle(event, tx as never, defer);
      await flush();

      const callsToUserB = (gateway.emitToUser as jest.Mock).mock.calls.filter(
        (args: unknown[]) => args[0] === 'user-b',
      );
      expect(callsToUserB).toHaveLength(0);
    });
  });

  describe('Test B: achievement.unlocked → enriched payload + stats_updated', () => {
    it('emits achievement_unlocked with catalog enrichment + stats_updated', async () => {
      const event = makeAchievementEvent('user-a', 'FIRST_GOAL');
      const tx = makeTx({
        code: 'FIRST_GOAL',
        name: 'First Goal',
        description: 'Complete your first quest',
        iconKey: 'trophy-icon',
      });
      const { defer, flush } = collectDeferred();

      await handler.handle(event, tx as never, defer);
      await flush();

      expect(gateway.emitToUser).toHaveBeenCalledWith('user-a', WIRE_EVENTS.ACHIEVEMENT_UNLOCKED, {
        code: 'FIRST_GOAL',
        name: 'First Goal',
        description: 'Complete your first quest',
        iconKey: 'trophy-icon',
      });
      expect(gateway.emitToUser).toHaveBeenCalledWith('user-a', WIRE_EVENTS.STATS_UPDATED, {});
    });

    it('achievement_unlocked without iconKey omits iconKey from payload', async () => {
      const event = makeAchievementEvent('user-a', 'FIRST_GOAL');
      const tx = makeTx({
        code: 'FIRST_GOAL',
        name: 'First Goal',
        description: 'Complete your first quest',
        iconKey: null,
      });
      const { defer, flush } = collectDeferred();

      await handler.handle(event, tx as never, defer);
      await flush();

      const achievementCall = (gateway.emitToUser as jest.Mock).mock.calls.find(
        (args: unknown[]) => args[1] === WIRE_EVENTS.ACHIEVEMENT_UNLOCKED,
      );
      expect(achievementCall).toBeDefined();
      expect((achievementCall as unknown[])[2]).not.toHaveProperty('iconKey');
    });
  });

  describe('Test C: achievement.unlocked catalog row null → no emit, error logged', () => {
    it('does not emit when achievement catalog row not found', async () => {
      const event = makeAchievementEvent('user-a', 'UNKNOWN_CODE');
      const tx = makeTx(null); // null = not found
      const { defer, flush } = collectDeferred();

      await handler.handle(event, tx as never, defer);
      await flush();

      expect(gateway.emitToUser).not.toHaveBeenCalled();
    });
  });

  describe('Test D: level.up with missing required fields → no emit, error logged', () => {
    it('does not emit when level.up payload missing newLevel', async () => {
      const event: DomainEvent = {
        eventId: 'evt-bad-level',
        type: EVENT_TYPES.LEVEL_UP,
        aggregateId: 'user-a',
        orgId: null,
        payload: { userId: 'user-a', orgId: null },
        occurredAt: new Date(),
      };
      const tx = makeTx();
      const { defer, flush } = collectDeferred();

      await handler.handle(event, tx as never, defer);
      await flush();

      expect(gateway.emitToUser).not.toHaveBeenCalled();
    });
  });

  describe('Test E: progression event → only stats_updated emitted', () => {
    it('workout.logged emits only stats_updated', async () => {
      const event = makeProgressionEvent('user-a');
      const tx = makeTx();
      const { defer, flush } = collectDeferred();

      await handler.handle(event, tx as never, defer);
      await flush();

      expect(gateway.emitToUser).toHaveBeenCalledTimes(1);
      expect(gateway.emitToUser).toHaveBeenCalledWith('user-a', WIRE_EVENTS.STATS_UPDATED, {});
    });
  });

  describe('Test G: ROLLBACK scenario — defer is only registered, not called inline', () => {
    it('handle() registers deferred fns but does NOT call emitToUser directly', async () => {
      const event = makeLevelUpEvent('user-a', 2, 3, 450);
      const tx = makeTx();
      const { defer } = collectDeferred();

      // Call handle but do NOT flush (simulates tx rollback — processor skips flush)
      await handler.handle(event, tx as never, defer);

      expect(gateway.emitToUser).not.toHaveBeenCalled();
    });
  });
});
