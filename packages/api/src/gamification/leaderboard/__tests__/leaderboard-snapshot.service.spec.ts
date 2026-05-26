import { LeaderboardSnapshotService } from '../leaderboard-snapshot.service';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeProfile = (
  userId: string,
  totalExp: number,
  level = 1,
  currentStreak = 0,
  leaderboardOptIn = true,
  displayName: string | null = null,
  avatarUrl: string | null = null,
) => ({ userId, totalExp, level, currentStreak, leaderboardOptIn, displayName, avatarUrl });

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('LeaderboardSnapshotService', () => {
  let service: LeaderboardSnapshotService;
  let mockPrisma: {
    dirtyLeaderboardUser: { findMany: jest.Mock };
    profile: { findMany: jest.Mock };
    $transaction: jest.Mock;
    leaderboardSnapshotEntry: { deleteMany: jest.Mock; createMany: jest.Mock };
  };

  beforeEach(() => {
    mockPrisma = {
      dirtyLeaderboardUser: {
        findMany: jest.fn(),
      },
      profile: {
        findMany: jest.fn(),
      },
      $transaction: jest.fn(),
      leaderboardSnapshotEntry: {
        deleteMany: jest.fn(),
        createMany: jest.fn(),
      },
    };

    service = new LeaderboardSnapshotService(mockPrisma as never);
  });

  it('returns early when no dirty users exist (no-op)', async () => {
    mockPrisma.dirtyLeaderboardUser.findMany.mockResolvedValue([]);

    await service.refresh();

    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    expect(mockPrisma.profile.findMany).not.toHaveBeenCalled();
  });

  it('recomputes global ranks in a transaction when dirty users exist', async () => {
    mockPrisma.dirtyLeaderboardUser.findMany.mockResolvedValue([
      { userId: 'u1', markedAt: new Date() },
    ]);

    const profiles = [makeProfile('u1', 1000, 5, 3), makeProfile('u2', 500, 3, 1)];
    mockPrisma.profile.findMany.mockResolvedValue(profiles);

    // Simulate $transaction calling the callback with a tx client
    const txDeleteMany = jest.fn().mockResolvedValue({ count: 2 });
    const txCreateMany = jest.fn().mockResolvedValue({ count: 2 });
    const txDirtyDeleteMany = jest.fn().mockResolvedValue({ count: 1 });

    mockPrisma.$transaction.mockImplementation(async (cb: (tx: unknown) => Promise<void>) => {
      const tx = {
        leaderboardSnapshotEntry: {
          deleteMany: txDeleteMany,
          createMany: txCreateMany,
        },
        dirtyLeaderboardUser: { deleteMany: txDirtyDeleteMany },
      };
      return cb(tx);
    });

    await service.refresh();

    expect(mockPrisma.profile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { leaderboardOptIn: true },
        orderBy: expect.arrayContaining([
          { totalExp: 'desc' },
          { level: 'desc' },
          { currentStreak: 'desc' },
          { userId: 'asc' },
        ]),
      }),
    );

    expect(txDeleteMany).toHaveBeenCalledWith({});
    expect(txCreateMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ userId: 'u1', rank: 1 }),
        expect.objectContaining({ userId: 'u2', rank: 2 }),
      ]),
    });
  });

  it('assigns correct rank order with tiebreaks in the snapshot', async () => {
    mockPrisma.dirtyLeaderboardUser.findMany.mockResolvedValue([
      { userId: 'u1', markedAt: new Date() },
    ]);

    // u3 beats u1 on streak despite same exp+level; u2 is last (low exp)
    const profiles = [
      makeProfile('u1', 1000, 5, 2),
      makeProfile('u3', 1000, 5, 8),
      makeProfile('u2', 200, 2, 1),
    ];
    mockPrisma.profile.findMany.mockResolvedValue(profiles);

    let capturedCreateData: unknown[] = [];
    mockPrisma.$transaction.mockImplementation(async (cb: (tx: unknown) => Promise<void>) => {
      const tx = {
        leaderboardSnapshotEntry: {
          deleteMany: jest.fn().mockResolvedValue({}),
          createMany: jest.fn().mockImplementation(({ data }: { data: unknown[] }) => {
            capturedCreateData = data;
            return Promise.resolve({ count: data.length });
          }),
        },
        dirtyLeaderboardUser: { deleteMany: jest.fn().mockResolvedValue({}) },
      };
      return cb(tx);
    });

    await service.refresh();

    const ranked = capturedCreateData as Array<{ userId: string; rank: number }>;
    expect(ranked.find((r) => r.userId === 'u3')?.rank).toBe(1);
    expect(ranked.find((r) => r.userId === 'u1')?.rank).toBe(2);
    expect(ranked.find((r) => r.userId === 'u2')?.rank).toBe(3);
  });

  it('clears dirty entries seen at snapshot time (not entries added during recompute)', async () => {
    const dirtyRows = [
      { userId: 'u1', markedAt: new Date() },
      { userId: 'u2', markedAt: new Date() },
    ];
    mockPrisma.dirtyLeaderboardUser.findMany.mockResolvedValue(dirtyRows);
    mockPrisma.profile.findMany.mockResolvedValue([makeProfile('u1', 500), makeProfile('u2', 300)]);

    let capturedDeleteWhere: unknown;
    mockPrisma.$transaction.mockImplementation(async (cb: (tx: unknown) => Promise<void>) => {
      const tx = {
        leaderboardSnapshotEntry: {
          deleteMany: jest.fn().mockResolvedValue({}),
          createMany: jest.fn().mockResolvedValue({ count: 2 }),
        },
        dirtyLeaderboardUser: {
          deleteMany: jest.fn().mockImplementation((args: unknown) => {
            capturedDeleteWhere = args;
            return Promise.resolve({ count: 2 });
          }),
        },
      };
      return cb(tx);
    });

    await service.refresh();

    // Only the ids that were dirty at the START of the refresh are cleared
    expect(capturedDeleteWhere).toEqual({
      where: { userId: { in: ['u1', 'u2'] } },
    });
  });

  it('snapshot entries include computedAt timestamp', async () => {
    mockPrisma.dirtyLeaderboardUser.findMany.mockResolvedValue([
      { userId: 'u1', markedAt: new Date() },
    ]);
    mockPrisma.profile.findMany.mockResolvedValue([makeProfile('u1', 100)]);

    let capturedData: unknown[] = [];
    mockPrisma.$transaction.mockImplementation(async (cb: (tx: unknown) => Promise<void>) => {
      const tx = {
        leaderboardSnapshotEntry: {
          deleteMany: jest.fn().mockResolvedValue({}),
          createMany: jest.fn().mockImplementation(({ data }: { data: unknown[] }) => {
            capturedData = data;
            return Promise.resolve({ count: data.length });
          }),
        },
        dirtyLeaderboardUser: { deleteMany: jest.fn().mockResolvedValue({}) },
      };
      return cb(tx);
    });

    await service.refresh();

    const entry = (capturedData as Array<{ computedAt: unknown }>)[0];
    expect(entry?.computedAt).toBeInstanceOf(Date);
  });
});
