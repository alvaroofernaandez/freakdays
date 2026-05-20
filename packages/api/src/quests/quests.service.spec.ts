import { BadRequestException, NotFoundException } from '@nestjs/common';

import { IdentityContextService } from '../common/identity/identity-context.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { QuestsService } from './quests.service';

const mockIdentity = {
  getActiveUserByClerkIdOrThrow: jest.fn().mockResolvedValue({ id: 'u1', clerkUserId: 'c1' }),
  getActiveOrganizationByContextOrThrow: jest
    .fn()
    .mockResolvedValue({ id: 'o1', clerkOrgId: null }),
  assertMembershipOrThrow: jest.fn(),
} as unknown as IdentityContextService;

const makeQuest = (overrides: Record<string, unknown> = {}) => ({
  id: 'q1',
  userId: 'u1',
  organizationId: 'o1',
  title: 'Finish chapter 1',
  description: null,
  difficulty: 'medium' as const,
  expReward: 50,
  isRecurring: false,
  recurrencePattern: null,
  dueDate: null,
  dueTime: null,
  reminderMinutesBefore: null,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('QuestsService', () => {
  let service: QuestsService;
  let mockPrisma: {
    quest: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    questCompletion: {
      create: jest.Mock;
      findMany: jest.Mock;
    };
    questNotification: {
      findMany: jest.Mock;
      updateMany: jest.Mock;
    };
    profile: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockPrisma = {
      quest: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
        update: jest.fn(),
      },
      questCompletion: {
        create: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
      },
      questNotification: {
        findMany: jest.fn().mockResolvedValue([]),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      profile: {
        findUnique: jest.fn().mockResolvedValue({ id: 'p1' }),
        update: jest.fn().mockResolvedValue({}),
      },
      $transaction: jest.fn().mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => {
        return cb(mockPrisma);
      }),
    };

    service = new QuestsService(mockPrisma as unknown as PrismaService, mockIdentity);
  });

  describe('list', () => {
    it('filters by userId, organizationId and active=true', async () => {
      const quests = [makeQuest(), makeQuest({ id: 'q2', title: 'Read 10 pages' })];
      mockPrisma.quest.findMany.mockResolvedValue(quests);

      const result = await service.list('c1', 'o1');

      expect(mockPrisma.quest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'u1', organizationId: 'o1', active: true },
          orderBy: { createdAt: 'desc' },
        }),
      );
      expect(result).toHaveLength(2);
      expect(result[0]?.title).toBe('Finish chapter 1');
    });

    it('returns empty array when no active quests exist', async () => {
      mockPrisma.quest.findMany.mockResolvedValue([]);

      const result = await service.list('c1', 'o1');

      expect(result).toHaveLength(0);
    });
  });

  describe('create', () => {
    it('throws BadRequestException when title is empty', async () => {
      await expect(service.create('c1', 'o1', { title: '' })).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when title is only whitespace', async () => {
      await expect(service.create('c1', 'o1', { title: '   ' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('creates quest with default difficulty=medium when not specified', async () => {
      const created = makeQuest({ title: 'New Quest', difficulty: 'medium' });
      mockPrisma.quest.create.mockResolvedValue(created);

      const result = await service.create('c1', 'o1', { title: 'New Quest' });

      expect(mockPrisma.quest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'New Quest',
            difficulty: 'medium',
            active: true,
          }),
        }),
      );
      expect(result.difficulty).toBe('medium');
    });

    it('creates quest with provided expReward', async () => {
      const created = makeQuest({ expReward: 100 });
      mockPrisma.quest.create.mockResolvedValue(created);

      await service.create('c1', 'o1', { title: 'Hard Quest', expReward: 100 });

      expect(mockPrisma.quest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ expReward: 100 }),
        }),
      );
    });
  });

  describe('complete', () => {
    it('throws NotFoundException when quest does not exist or is inactive', async () => {
      mockPrisma.quest.findFirst.mockResolvedValue(null);

      await expect(service.complete('c1', 'o1', 'nonexistent-quest')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('creates QuestCompletion and increments Profile totalExp', async () => {
      const quest = makeQuest({ expReward: 75 });
      mockPrisma.quest.findFirst.mockResolvedValue(quest);
      mockPrisma.profile.findUnique.mockResolvedValue({ id: 'p1' });

      const result = await service.complete('c1', 'o1', 'q1');

      expect(mockPrisma.questCompletion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            questId: 'q1',
            userId: 'u1',
            organizationId: 'o1',
            expEarned: 75,
          }),
        }),
      );
      expect(mockPrisma.profile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'p1' },
          data: { totalExp: { increment: 75 } },
        }),
      );
      expect(result.expEarned).toBe(75);
    });

    it('skips profile update when profile does not exist', async () => {
      const quest = makeQuest({ expReward: 30 });
      mockPrisma.quest.findFirst.mockResolvedValue(quest);
      mockPrisma.profile.findUnique.mockResolvedValue(null);

      const result = await service.complete('c1', 'o1', 'q1');

      expect(mockPrisma.profile.update).not.toHaveBeenCalled();
      expect(result.expEarned).toBe(30);
    });
  });
});
