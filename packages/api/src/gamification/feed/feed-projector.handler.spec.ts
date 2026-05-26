import { EVENT_TYPES } from '../../events/event-types';
import type { DomainEvent, LevelUpPayload } from '../../events/event.types';
import type { DeferFn } from '../../events/interfaces/domain-event-handler.interface';
import type { RealtimeGateway } from '../../realtime/realtime.gateway';
import { FeedProjectorHandler } from './feed-projector.handler';

// ─── Prisma transaction mock helpers ─────────────────────────────────────────

const defaultFeedEntry = { id: 'entry-default', createdAt: new Date() };

const makeTx = (
  overrides: {
    eventHandlerLog?: { findUnique?: jest.Mock; create?: jest.Mock };
    partyMember?: { findMany?: jest.Mock };
    feedEntry?: { create?: jest.Mock };
  } = {},
) => ({
  eventHandlerLog: {
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({}),
    ...overrides.eventHandlerLog,
  },
  partyMember: {
    findMany: jest.fn().mockResolvedValue([]),
    ...overrides.partyMember,
  },
  feedEntry: {
    create: jest.fn().mockResolvedValue(defaultFeedEntry),
    ...overrides.feedEntry,
  },
});

const makeGateway = (): jest.Mocked<Pick<RealtimeGateway, 'emitToParty'>> => ({
  emitToParty: jest.fn(),
});

const makeLevelUpEvent = (userId = 'u1', eventId = 'evt-1'): DomainEvent<LevelUpPayload> => ({
  eventId,
  type: EVENT_TYPES.LEVEL_UP,
  aggregateId: userId,
  orgId: 'org-1',
  payload: {
    userId,
    orgId: 'org-1',
    previousLevel: 1,
    newLevel: 2,
    totalExp: 100,
  },
  occurredAt: new Date(),
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FeedProjectorHandler', () => {
  let handler: FeedProjectorHandler;
  let gateway: ReturnType<typeof makeGateway>;

  beforeEach(() => {
    gateway = makeGateway();
    handler = new FeedProjectorHandler(gateway as unknown as RealtimeGateway);
    jest.clearAllMocks();
  });

  it('(a) level.up event for user in 2 parties → 2 FeedEntry inserts + EventHandlerLog', async () => {
    const event = makeLevelUpEvent('u1', 'evt-1');
    const defer = jest.fn() as jest.MockedFunction<DeferFn>;
    const tx = makeTx({
      partyMember: {
        findMany: jest.fn().mockResolvedValue([{ partyId: 'p1' }, { partyId: 'p2' }]),
      },
      feedEntry: { create: jest.fn().mockResolvedValue({ id: 'entry-p1', createdAt: new Date() }) },
    });

    await handler.handle(event, tx as never, defer);

    expect(tx.eventHandlerLog.findUnique).toHaveBeenCalledWith({
      where: { eventId_handler: { eventId: 'evt-1', handler: 'feed-projector' } },
    });
    expect(tx.eventHandlerLog.create).toHaveBeenCalledTimes(1);
    expect(tx.feedEntry.create).toHaveBeenCalledTimes(2);
    expect(defer).toHaveBeenCalledTimes(2);
  });

  it('(e) deferred push payload carries the real FeedEntry id (not empty string)', async () => {
    const createdAt = new Date('2026-05-26T10:00:00Z');
    const event = makeLevelUpEvent('u1', 'evt-real-id');
    const capturedPayloads: unknown[] = [];

    const defer = jest.fn().mockImplementation((fn: () => void) => {
      fn(); // execute deferred fn immediately so we can inspect emitToParty calls
    }) as jest.MockedFunction<DeferFn>;

    const tx = makeTx({
      partyMember: {
        findMany: jest.fn().mockResolvedValue([{ partyId: 'party-abc' }]),
      },
      feedEntry: {
        create: jest.fn().mockResolvedValue({ id: 'entry-xyz-123', createdAt }),
      },
    });

    // Capture what emitToParty was called with
    gateway.emitToParty.mockImplementation((_partyId, _event, payload: unknown) => {
      capturedPayloads.push(payload);
    });

    await handler.handle(event, tx as never, defer);

    expect(capturedPayloads).toHaveLength(1);
    const payload = capturedPayloads[0] as { id: string; createdAt: string };
    expect(payload.id).toBe('entry-xyz-123');
    expect(payload.id).not.toBe('');
    expect(payload.createdAt).toBe(createdAt.toISOString());
  });

  it('(b) replay (EventHandlerLog exists) → no inserts, no error', async () => {
    const event = makeLevelUpEvent('u1', 'evt-replay');
    const defer = jest.fn() as jest.MockedFunction<DeferFn>;
    const tx = makeTx({
      eventHandlerLog: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ eventId: 'evt-replay', handler: 'feed-projector' }),
        create: jest.fn(),
      },
    });

    await expect(handler.handle(event, tx as never, defer)).resolves.toBeUndefined();

    expect(tx.feedEntry.create).not.toHaveBeenCalled();
    expect(defer).not.toHaveBeenCalled();
  });

  it('(c) @@unique conflict (P2002) on feedEntry.create → swallowed, no error thrown', async () => {
    const event = makeLevelUpEvent('u1', 'evt-conflict');
    const defer = jest.fn() as jest.MockedFunction<DeferFn>;

    const p2002 = Object.assign(new Error('Unique constraint'), { code: 'P2002' });
    const tx = makeTx({
      partyMember: {
        findMany: jest.fn().mockResolvedValue([{ partyId: 'p1' }]),
      },
      feedEntry: { create: jest.fn().mockRejectedValue(p2002) },
    });

    await expect(handler.handle(event, tx as never, defer)).resolves.toBeUndefined();
  });

  it('(d) manga.chapter.read event → no FeedEntry created', async () => {
    const event: DomainEvent = {
      eventId: 'evt-manga',
      type: 'manga.progressed' as never,
      aggregateId: 'u1',
      orgId: 'org-1',
      payload: { userId: 'u1', orgId: 'org-1' },
      occurredAt: new Date(),
    };
    const defer = jest.fn() as jest.MockedFunction<DeferFn>;
    const tx = makeTx();

    await handler.handle(event, tx as never, defer);

    expect(tx.feedEntry.create).not.toHaveBeenCalled();
    expect(defer).not.toHaveBeenCalled();
  });
});
