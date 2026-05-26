import { ForbiddenException } from '@nestjs/common';
import type { FeedEntry } from '@prisma/client';
import { FeedService } from './feed.service';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeFeedEntry = (overrides: Partial<FeedEntry> = {}): FeedEntry => ({
  id: `fe-${Math.random().toString(36).slice(2)}`,
  partyId: 'p1',
  actorUserId: 'u1',
  type: 'level.up',
  payload: { newLevel: 2 },
  sourceEventId: `evt-${Math.random().toString(36).slice(2)}`,
  createdAt: new Date('2026-01-01T12:00:00Z'),
  ...overrides,
});

const makePrisma = (
  overrides: {
    partyMember?: { findUnique?: jest.Mock };
    feedEntry?: { findMany?: jest.Mock };
  } = {},
) => ({
  partyMember: {
    findUnique: jest.fn().mockResolvedValue({ partyId: 'p1', userId: 'u1' }),
    ...overrides.partyMember,
  },
  feedEntry: {
    findMany: jest.fn().mockResolvedValue([]),
    ...overrides.feedEntry,
  },
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FeedService', () => {
  it('(a) member gets newest-first page with cursor', async () => {
    const entries = [
      makeFeedEntry({ id: 'fe-1', createdAt: new Date('2026-01-01T13:00:00Z') }),
      makeFeedEntry({ id: 'fe-2', createdAt: new Date('2026-01-01T12:00:00Z') }),
      makeFeedEntry({ id: 'fe-3', createdAt: new Date('2026-01-01T11:00:00Z') }),
    ];
    const prisma = makePrisma({
      feedEntry: { findMany: jest.fn().mockResolvedValue(entries) },
    });

    const service = new FeedService(prisma as never);
    const result = await service.getPartyFeed('p1', 'u1', undefined, 2);

    // 3 entries returned (limit+1); service should detect nextCursor
    expect(result.items).toHaveLength(2);
    expect(result.nextCursor).toBe('fe-3');
  });

  it('(b) non-member → ForbiddenException', async () => {
    const prisma = makePrisma({
      partyMember: { findUnique: jest.fn().mockResolvedValue(null) },
    });

    const service = new FeedService(prisma as never);

    await expect(service.getPartyFeed('p1', 'non-member', undefined, 20)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('(c) cursor advances to correct next page', async () => {
    const entries = [
      makeFeedEntry({ id: 'fe-a' }),
      makeFeedEntry({ id: 'fe-b' }),
      makeFeedEntry({ id: 'fe-c' }),
    ];
    const prisma = makePrisma({
      feedEntry: { findMany: jest.fn().mockResolvedValue(entries) },
    });

    const service = new FeedService(prisma as never);
    const result = await service.getPartyFeed('p1', 'u1', undefined, 2);

    expect(result.nextCursor).toBe('fe-c');
    expect(prisma.feedEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: expect.arrayContaining([{ createdAt: 'desc' }]),
        take: 3, // limit + 1
      }),
    );
  });

  it('(d) last page has no nextCursor', async () => {
    const entries = [makeFeedEntry({ id: 'fe-1' })];
    const prisma = makePrisma({
      feedEntry: { findMany: jest.fn().mockResolvedValue(entries) },
    });

    const service = new FeedService(prisma as never);
    const result = await service.getPartyFeed('p1', 'u1', undefined, 5);

    expect(result.nextCursor).toBeUndefined();
    expect(result.items).toHaveLength(1);
  });
});
