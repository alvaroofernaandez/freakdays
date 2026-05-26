import { LeaderboardService } from '../leaderboard.service';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeSnapshotEntry = (
  userId: string,
  rank: number,
  totalExp = 1000,
  level = 5,
  currentStreak = 3,
  displayName: string | null = null,
  avatarUrl: string | null = null,
) => ({
  userId,
  rank,
  totalExp,
  level,
  currentStreak,
  displayName,
  avatarUrl,
  computedAt: new Date(),
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('LeaderboardService.getGlobalLeaderboard — snapshot read switch', () => {
  it('reads page from snapshot when snapshot is non-empty', async () => {
    const snapshotEntries = [
      makeSnapshotEntry('u1', 1, 2000, 10, 5, 'Alice'),
      makeSnapshotEntry('u2', 2, 1500, 8, 3, 'Bob'),
    ];

    const mockPrisma = {
      partyMember: { findUnique: jest.fn() },
      leaderboardSnapshotEntry: {
        count: jest.fn().mockResolvedValue(2),
        findMany: jest.fn().mockResolvedValue(snapshotEntries),
        findUnique: jest.fn().mockResolvedValue(makeSnapshotEntry('u1', 1)),
      },
      profile: { findMany: jest.fn(), findUnique: jest.fn(), count: jest.fn() },
    };

    const service = new LeaderboardService(mockPrisma as never);
    const result = await service.getGlobalLeaderboard('u1', 1, 10);

    // Must read from snapshot (findMany on leaderboardSnapshotEntry)
    expect(mockPrisma.leaderboardSnapshotEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { rank: 'asc' } }),
    );
    // Must NOT fall back to Profile scan
    expect(mockPrisma.profile.findMany).not.toHaveBeenCalled();

    expect(result.items).toHaveLength(2);
    expect(result.items[0]!.userId).toBe('u1');
    expect(result.items[0]!.rank).toBe(1);
    expect(result.items[0]!.displayName).toBe('Alice');
    expect(result.total).toBe(2);
  });

  it('yourRank is an O(1) snapshot lookup, not an OR-count query', async () => {
    const mockPrisma = {
      partyMember: { findUnique: jest.fn() },
      leaderboardSnapshotEntry: {
        count: jest.fn().mockResolvedValue(5),
        findMany: jest.fn().mockResolvedValue([makeSnapshotEntry('u3', 3)]),
        findUnique: jest.fn().mockResolvedValue(makeSnapshotEntry('caller', 7)),
      },
      profile: { findMany: jest.fn(), findUnique: jest.fn(), count: jest.fn() },
    };

    const service = new LeaderboardService(mockPrisma as never);
    const result = await service.getGlobalLeaderboard('caller', 1, 10);

    expect(result.yourRank).toBe(7);
    // The old O(N) OR-count on profile must NOT be called
    expect(mockPrisma.profile.count).not.toHaveBeenCalled();
    // snapshot lookup must be called
    expect(mockPrisma.leaderboardSnapshotEntry.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'caller' } }),
    );
  });

  it('yourRank is null when caller is not in snapshot', async () => {
    const mockPrisma = {
      partyMember: { findUnique: jest.fn() },
      leaderboardSnapshotEntry: {
        count: jest.fn().mockResolvedValue(3),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null), // caller not in snapshot
      },
      profile: { findMany: jest.fn(), findUnique: jest.fn(), count: jest.fn() },
    };

    const service = new LeaderboardService(mockPrisma as never);
    const result = await service.getGlobalLeaderboard('unknown-user', 1, 10);

    expect(result.yourRank).toBeNull();
  });

  it('falls back to live Profile query on cold start (empty snapshot)', async () => {
    const mockPrisma = {
      partyMember: { findUnique: jest.fn() },
      leaderboardSnapshotEntry: {
        count: jest.fn().mockResolvedValue(0), // snapshot is empty
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      profile: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        count: jest.fn().mockResolvedValue(0),
      },
    };

    const service = new LeaderboardService(mockPrisma as never);
    await service.getGlobalLeaderboard('caller', 1, 10);

    // Cold-start fallback must use Profile queries
    expect(mockPrisma.profile.findMany).toHaveBeenCalled();
    // Snapshot findMany must NOT be called (snapshot is empty)
    expect(mockPrisma.leaderboardSnapshotEntry.findMany).not.toHaveBeenCalled();
  });

  it('page items have isCurrentUser set correctly', async () => {
    const snapshotEntries = [makeSnapshotEntry('caller', 2), makeSnapshotEntry('other', 1)];

    const mockPrisma = {
      partyMember: { findUnique: jest.fn() },
      leaderboardSnapshotEntry: {
        count: jest.fn().mockResolvedValue(2),
        findMany: jest.fn().mockResolvedValue(snapshotEntries),
        findUnique: jest.fn().mockResolvedValue(makeSnapshotEntry('caller', 2)),
      },
      profile: { findMany: jest.fn(), findUnique: jest.fn(), count: jest.fn() },
    };

    const service = new LeaderboardService(mockPrisma as never);
    const result = await service.getGlobalLeaderboard('caller', 1, 10);

    const callerItem = result.items.find((i) => i.userId === 'caller');
    const otherItem = result.items.find((i) => i.userId === 'other');
    expect(callerItem?.isCurrentUser).toBe(true);
    expect(otherItem?.isCurrentUser).toBe(false);
  });

  it('pagination skip/take is applied to snapshot query', async () => {
    const mockPrisma = {
      partyMember: { findUnique: jest.fn() },
      leaderboardSnapshotEntry: {
        count: jest.fn().mockResolvedValue(30),
        findMany: jest.fn().mockResolvedValue([makeSnapshotEntry('u11', 11)]),
        findUnique: jest.fn().mockResolvedValue(null),
      },
      profile: { findMany: jest.fn(), findUnique: jest.fn(), count: jest.fn() },
    };

    const service = new LeaderboardService(mockPrisma as never);
    await service.getGlobalLeaderboard('caller', 2, 10); // page 2, limit 10 → skip 10

    expect(mockPrisma.leaderboardSnapshotEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 }),
    );
  });
});
