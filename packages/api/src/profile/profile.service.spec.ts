import { BadRequestException } from '@nestjs/common';
import { computeLevel } from '@freakdays/domain';

import { IdentityContextService } from '../common/identity/identity-context.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { EventBusService } from '../events/event-bus.service';
import { EVENT_TYPES } from '../events/event-types';
import { StorageService } from '../storage/storage.service';
import { ProfileService } from './profile.service';

const mockUser = { id: 'u1', clerkUserId: 'clerk-u1', isActive: true };

const mockProfile = {
  id: 'p1',
  userId: 'u1',
  username: 'testuser',
  displayName: null,
  avatarUrl: null,
  avatarKey: null,
  bannerUrl: null,
  bannerKey: null,
  totalExp: 0,
  level: 1,
  bio: null,
  favoriteAnimeId: null,
  favoriteMangaId: null,
  location: null,
  website: null,
  socialLinks: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockIdentity = {
  getActiveUserByClerkIdOrThrow: jest.fn().mockResolvedValue(mockUser),
} as unknown as IdentityContextService;

const mockStorage = {} as unknown as StorageService;

describe('ProfileService', () => {
  let service: ProfileService;
  let mockPrisma: {
    profile: { findUnique: jest.Mock; create: jest.Mock; update: jest.Mock };
    outboxEvent: { create: jest.Mock };
    $transaction: jest.Mock;
  };
  let mockEventBus: { emit: jest.Mock; buildEvent: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();

    mockPrisma = {
      profile: {
        findUnique: jest.fn().mockResolvedValue(mockProfile),
        create: jest.fn(),
        update: jest.fn().mockResolvedValue(mockProfile),
      },
      outboxEvent: { create: jest.fn().mockResolvedValue({}) },
      $transaction: jest
        .fn()
        .mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => cb(mockPrisma)),
    };

    mockEventBus = {
      emit: jest.fn().mockResolvedValue(undefined),
      buildEvent: jest.fn().mockReturnValue({
        eventId: 'mock-login-evt-id',
        type: EVENT_TYPES.DAILY_LOGIN,
        aggregateId: 'u1',
        orgId: 'o1',
        payload: {},
        occurredAt: new Date(),
      }),
    };

    service = new ProfileService(
      mockPrisma as unknown as PrismaService,
      mockStorage,
      mockIdentity,
      mockEventBus as unknown as EventBusService,
    );
  });

  describe('addExp', () => {
    it('throws when amount is greater than 1000', async () => {
      await expect(service.addExp('clerk-u1', { amount: 1001 })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws when amount is zero or negative', async () => {
      await expect(service.addExp('clerk-u1', { amount: 0 })).rejects.toThrow(BadRequestException);

      await expect(service.addExp('clerk-u1', { amount: -5 })).rejects.toThrow(BadRequestException);
    });

    it('updates totalExp and level on valid amount', async () => {
      mockPrisma.profile.update.mockResolvedValue({ ...mockProfile, totalExp: 100, level: 2 });

      const result = await service.addExp('clerk-u1', { amount: 100 });

      expect(result.newTotal).toBe(100);
      expect(result.newLevel).toBe(2);
      expect(mockPrisma.profile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ totalExp: 100, level: 2 }),
        }),
      );
    });

    it('delegates level computation to shared computeLevel from @freakdays/domain', async () => {
      // profile.totalExp = 0, adding 195 → newTotal = 195 → computeLevel(195) = 2
      const addAmount = 195;
      const expectedTotal = mockProfile.totalExp + addAmount;
      const expectedLevel = computeLevel(expectedTotal);

      mockPrisma.profile.update.mockResolvedValue({
        ...mockProfile,
        totalExp: expectedTotal,
        level: expectedLevel,
      });

      const result = await service.addExp('clerk-u1', { amount: addAmount });

      expect(result.newLevel).toBe(expectedLevel);
      expect(mockPrisma.profile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ totalExp: expectedTotal, level: expectedLevel }),
        }),
      );
    });
  });

  describe('touchDailyLogin', () => {
    it('emits DAILY_LOGIN and updates lastLoginDate when first login of day', async () => {
      const today = new Date().toISOString().split('T')[0]!;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]!;
      mockPrisma.profile.findUnique.mockResolvedValue({
        ...mockProfile,
        lastLoginDate: yesterday,
      });

      const result = await service.touchDailyLogin('u1', 'o1');

      expect(result).toBe(true);
      expect(mockPrisma.profile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ lastLoginDate: today }),
        }),
      );
      expect(mockEventBus.buildEvent).toHaveBeenCalledWith(
        EVENT_TYPES.DAILY_LOGIN,
        'u1',
        expect.objectContaining({ userId: 'u1', orgId: 'o1', loginDate: today }),
        'o1',
      );
      expect(mockEventBus.emit).toHaveBeenCalledTimes(1);
    });

    it('suppresses DAILY_LOGIN when lastLoginDate equals today', async () => {
      const today = new Date().toISOString().split('T')[0]!;
      mockPrisma.profile.findUnique.mockResolvedValue({
        ...mockProfile,
        lastLoginDate: today,
      });

      const result = await service.touchDailyLogin('u1', 'o1');

      expect(result).toBe(false);
      expect(mockPrisma.profile.update).not.toHaveBeenCalled();
      expect(mockEventBus.emit).not.toHaveBeenCalled();
    });

    it('emits DAILY_LOGIN when lastLoginDate is null (new user)', async () => {
      mockPrisma.profile.findUnique.mockResolvedValue({
        ...mockProfile,
        lastLoginDate: null,
      });

      const result = await service.touchDailyLogin('u1', 'o1');

      expect(result).toBe(true);
      expect(mockEventBus.emit).toHaveBeenCalledTimes(1);
    });

    it('returns false without throwing when profile does not exist', async () => {
      mockPrisma.profile.findUnique.mockResolvedValue(null);

      const result = await service.touchDailyLogin('u1', 'o1');

      expect(result).toBe(false);
      expect(mockEventBus.emit).not.toHaveBeenCalled();
    });
  });
});
