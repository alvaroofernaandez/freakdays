import type { FeedEntry } from '@prisma/client';

import { FeedService } from '../feed.service';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeFeedEntry = (overrides: Partial<FeedEntry> = {}): FeedEntry => ({
  id: `fe-${Math.random().toString(36).slice(2)}`,
  partyId: 'p1',
  actorUserId: 'u-friend-1',
  type: 'level.up',
  payload: { newLevel: 2 },
  sourceEventId: `evt-${Math.random().toString(36).slice(2)}`,
  createdAt: new Date('2026-01-01T12:00:00Z'),
  ...overrides,
});

const makePrisma = (feedEntries: FeedEntry[] = []) => ({
  partyMember: {
    findUnique: jest.fn().mockResolvedValue({ partyId: 'p1', userId: 'u-caller' }),
  },
  feedEntry: {
    findMany: jest.fn().mockResolvedValue(feedEntries),
  },
});

const makeFriendshipService = (friendIds: string[] = []) => ({
  listFriends: jest.fn().mockResolvedValue(friendIds),
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FeedService.getFriendFeed', () => {
  it('(a) returns empty list immediately when caller has no friends', async () => {
    const prisma = makePrisma();
    const friendshipService = makeFriendshipService([]);
    const service = new FeedService(prisma as never, friendshipService as never);

    const result = await service.getFriendFeed('u-caller');

    expect(result).toEqual({ items: [], nextCursor: undefined });
    expect(prisma.feedEntry.findMany).not.toHaveBeenCalled();
  });

  it('(b) queries actorUserId IN friendIds with orderBy createdAt desc then id desc', async () => {
    const prisma = makePrisma([]);
    const friendIds = ['u-friend-1', 'u-friend-2'];
    const friendshipService = makeFriendshipService(friendIds);
    const service = new FeedService(prisma as never, friendshipService as never);

    await service.getFriendFeed('u-caller');

    expect(prisma.feedEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { actorUserId: { in: friendIds } },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
    );
  });

  it('(c) uses take limit+1 to detect next page', async () => {
    const prisma = makePrisma([]);
    const friendshipService = makeFriendshipService(['u-friend-1']);
    const service = new FeedService(prisma as never, friendshipService as never);

    await service.getFriendFeed('u-caller', undefined, 5);

    expect(prisma.feedEntry.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 6 }));
  });

  it('(d) populates nextCursor and trims items when results exceed limit', async () => {
    const entries = [
      makeFeedEntry({ id: 'fe-1', actorUserId: 'u-friend-1' }),
      makeFeedEntry({ id: 'fe-2', actorUserId: 'u-friend-1' }),
      makeFeedEntry({ id: 'fe-3', actorUserId: 'u-friend-1' }),
    ];
    const prisma = makePrisma(entries);
    const friendshipService = makeFriendshipService(['u-friend-1']);
    const service = new FeedService(prisma as never, friendshipService as never);

    const result = await service.getFriendFeed('u-caller', undefined, 2);

    expect(result.items).toHaveLength(2);
    expect(result.nextCursor).toBe('fe-3');
  });

  it('(e) last page has no nextCursor', async () => {
    const entries = [makeFeedEntry({ id: 'fe-1' })];
    const prisma = makePrisma(entries);
    const friendshipService = makeFriendshipService(['u-friend-1']);
    const service = new FeedService(prisma as never, friendshipService as never);

    const result = await service.getFriendFeed('u-caller', undefined, 20);

    expect(result.nextCursor).toBeUndefined();
    expect(result.items).toHaveLength(1);
  });

  it('(f) passes cursor with skip:1 when cursor is provided', async () => {
    const prisma = makePrisma([]);
    const friendshipService = makeFriendshipService(['u-friend-1']);
    const service = new FeedService(prisma as never, friendshipService as never);

    await service.getFriendFeed('u-caller', 'fe-cursor-id', 20);

    expect(prisma.feedEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        cursor: { id: 'fe-cursor-id' },
        skip: 1,
      }),
    );
  });

  it('(g) calls listFriends with the correct userId', async () => {
    const prisma = makePrisma([]);
    const friendshipService = makeFriendshipService(['u-friend-1']);
    const service = new FeedService(prisma as never, friendshipService as never);

    await service.getFriendFeed('u-caller');

    expect(friendshipService.listFriends).toHaveBeenCalledWith('u-caller');
  });
});
