import { EVENT_TYPES } from '../../../events/event-types';
import type { DomainEvent } from '../../../events/event.types';
import { LeaderboardProjectorHandler } from '../leaderboard-projector.handler';

const makeEvent = (type: string, userId = 'u1'): DomainEvent => ({
  eventId: 'evt-1',
  type: type as DomainEvent['type'],
  aggregateId: userId,
  orgId: 'org-1',
  payload: { userId },
  occurredAt: new Date(),
});

describe('LeaderboardProjectorHandler', () => {
  let handler: LeaderboardProjectorHandler;
  let dirtyUpsert: jest.Mock;
  let mockTx: { dirtyLeaderboardUser: { upsert: jest.Mock } };

  beforeEach(() => {
    dirtyUpsert = jest.fn().mockResolvedValue({ userId: 'u1', markedAt: new Date() });
    mockTx = {
      dirtyLeaderboardUser: { upsert: dirtyUpsert },
    };
    handler = new LeaderboardProjectorHandler();
  });

  it('has name "leaderboard-projector"', () => {
    expect(handler.name).toBe('leaderboard-projector');
  });

  it('handles EXP-changing events: QUEST_COMPLETED, WORKOUT_LOGGED, ANIME_PROGRESSED, ANIME_COMPLETED, MANGA_PROGRESSED, DAILY_LOGIN, LEVEL_UP', () => {
    const expectedHandles = [
      EVENT_TYPES.QUEST_COMPLETED,
      EVENT_TYPES.WORKOUT_LOGGED,
      EVENT_TYPES.ANIME_PROGRESSED,
      EVENT_TYPES.ANIME_COMPLETED,
      EVENT_TYPES.MANGA_PROGRESSED,
      EVENT_TYPES.DAILY_LOGIN,
      EVENT_TYPES.LEVEL_UP,
    ];
    for (const et of expectedHandles) {
      expect(handler.handles).toContain(et);
    }
  });

  it('does NOT handle ACHIEVEMENT_UNLOCKED (no EXP change)', () => {
    expect(handler.handles).not.toContain(EVENT_TYPES.ACHIEVEMENT_UNLOCKED);
  });

  it('marks user dirty on QUEST_COMPLETED', async () => {
    const event = makeEvent(EVENT_TYPES.QUEST_COMPLETED, 'user-42');
    await handler.handle(event, mockTx as never);
    expect(dirtyUpsert).toHaveBeenCalledWith({
      where: { userId: 'user-42' },
      create: { userId: 'user-42' },
      update: {},
    });
  });

  it('marks user dirty on LEVEL_UP', async () => {
    const event = makeEvent(EVENT_TYPES.LEVEL_UP, 'user-99');
    await handler.handle(event, mockTx as never);
    expect(dirtyUpsert).toHaveBeenCalledWith({
      where: { userId: 'user-99' },
      create: { userId: 'user-99' },
      update: {},
    });
  });

  it('upsert is idempotent — same userId twice calls upsert twice (PK dedup by DB)', async () => {
    const event = makeEvent(EVENT_TYPES.WORKOUT_LOGGED, 'user-dupe');
    await handler.handle(event, mockTx as never);
    await handler.handle(event, mockTx as never);
    expect(dirtyUpsert).toHaveBeenCalledTimes(2);
    // Both calls identical — the DB's PK constraint ensures one row
    expect(dirtyUpsert).toHaveBeenNthCalledWith(1, {
      where: { userId: 'user-dupe' },
      create: { userId: 'user-dupe' },
      update: {},
    });
    expect(dirtyUpsert).toHaveBeenNthCalledWith(2, {
      where: { userId: 'user-dupe' },
      create: { userId: 'user-dupe' },
      update: {},
    });
  });

  it('logs warning and returns when userId is missing from payload', async () => {
    const event: DomainEvent = {
      eventId: 'evt-bad',
      type: EVENT_TYPES.QUEST_COMPLETED,
      aggregateId: 'x',
      orgId: null,
      payload: {},
      occurredAt: new Date(),
    };
    await handler.handle(event, mockTx as never);
    expect(dirtyUpsert).not.toHaveBeenCalled();
  });
});
