import { ForbiddenException } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeProfile = (overrides: {
  userId?: string;
  displayName?: string;
  avatarUrl?: string | null;
  totalExp?: number;
  level?: number;
  currentStreak?: number;
  leaderboardOptIn?: boolean;
}) => ({
  id: `p-${Math.random().toString(36).slice(2)}`,
  userId: 'u1',
  username: null,
  displayName: null,
  avatarUrl: null,
  totalExp: 0,
  level: 1,
  currentStreak: 0,
  leaderboardOptIn: false,
  ...overrides,
});

const makePartyMember = (userId: string, profile: ReturnType<typeof makeProfile>) => ({
  id: `pm-${Math.random().toString(36).slice(2)}`,
  partyId: 'p1',
  userId,
  role: 'member' as const,
  joinedAt: new Date(),
  user: {
    id: userId,
    profile,
  },
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('LeaderboardService', () => {
  describe('getPartyLeaderboard', () => {
    it('(a) ranking order: B > A > C — tiebreak on streak then userId', async () => {
      const memberA = makePartyMember(
        'user-a',
        makeProfile({
          userId: 'user-a',
          displayName: 'A',
          totalExp: 1000,
          level: 5,
          currentStreak: 3,
        }),
      );
      const memberB = makePartyMember(
        'user-b',
        makeProfile({
          userId: 'user-b',
          displayName: 'B',
          totalExp: 1000,
          level: 5,
          currentStreak: 7,
        }),
      );
      const memberC = makePartyMember(
        'user-c',
        makeProfile({
          userId: 'user-c',
          displayName: 'C',
          totalExp: 500,
          level: 3,
          currentStreak: 10,
        }),
      );

      const prisma = {
        partyMember: {
          findUnique: jest.fn().mockResolvedValue({ partyId: 'p1', userId: 'user-a' }),
          findMany: jest.fn().mockResolvedValue([memberA, memberB, memberC]),
        },
        profile: { count: jest.fn() },
      };

      const service = new LeaderboardService(prisma as never);
      const result = await service.getPartyLeaderboard('p1', 'user-a', 1, 50);

      expect(result.items[0]!.userId).toBe('user-b'); // B first
      expect(result.items[1]!.userId).toBe('user-a'); // A second
      expect(result.items[2]!.userId).toBe('user-c'); // C third
    });

    it('(b) yourRank = 15 when user is on page 3 but first page requested', async () => {
      const members = Array.from({ length: 20 }, (_, i) => {
        const uid = `user-${i + 1}`;
        return makePartyMember(uid, makeProfile({ userId: uid, totalExp: (20 - i) * 100 }));
      });

      const prisma = {
        partyMember: {
          findUnique: jest.fn().mockResolvedValue({ partyId: 'p1', userId: 'user-15' }),
          findMany: jest.fn().mockResolvedValue(members),
        },
        profile: { count: jest.fn() },
      };

      const service = new LeaderboardService(prisma as never);
      const result = await service.getPartyLeaderboard('p1', 'user-15', 1, 5);

      // user-15 has totalExp = (20-14)*100 = 600, ranked 15th
      expect(result.yourRank).toBe(15);
      expect(result.items).toHaveLength(5);
    });

    it('(c) non-member → ForbiddenException', async () => {
      const prisma = {
        partyMember: {
          findUnique: jest.fn().mockResolvedValue(null),
          findMany: jest.fn(),
        },
        profile: { count: jest.fn() },
      };

      const service = new LeaderboardService(prisma as never);

      await expect(service.getPartyLeaderboard('p1', 'outsider', 1, 50)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getGlobalLeaderboard', () => {
    it('(d) global excludes opted-out users', async () => {
      const profileX = makeProfile({
        userId: 'user-x',
        displayName: 'X',
        totalExp: 800,
        leaderboardOptIn: true,
      });
      const callerProfile = makeProfile({ userId: 'user-x', leaderboardOptIn: true });

      const prisma = {
        partyMember: { findUnique: jest.fn() },
        profile: {
          findMany: jest.fn().mockResolvedValue([profileX]),
          findUnique: jest.fn().mockResolvedValue(callerProfile),
          count: jest.fn().mockResolvedValue(0),
        },
      };

      const service = new LeaderboardService(prisma as never);
      const result = await service.getGlobalLeaderboard('user-x', 1, 50);

      // Only X appears (Y was opted-out and the findMany mocked only returns X)
      expect(result.items).toHaveLength(1);
      expect(result.items[0]!.userId).toBe('user-x');
    });

    it('(e) yourRank = null when caller is not opted in', async () => {
      const callerProfile = makeProfile({ userId: 'caller', leaderboardOptIn: false });

      const prisma = {
        partyMember: { findUnique: jest.fn() },
        profile: {
          findMany: jest.fn().mockResolvedValue([]),
          findUnique: jest.fn().mockResolvedValue(callerProfile),
          count: jest.fn().mockResolvedValue(0),
        },
      };

      const service = new LeaderboardService(prisma as never);
      const result = await service.getGlobalLeaderboard('caller', 1, 50);

      expect(result.yourRank).toBeNull();
    });
  });
});
