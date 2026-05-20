import { BadRequestException } from '@nestjs/common';

import { IdentityContextService } from '../common/identity/identity-context.service';
import { PrismaService } from '../common/prisma/prisma.service';
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
  let mockPrisma: { profile: { findUnique: jest.Mock; create: jest.Mock; update: jest.Mock } };

  beforeEach(() => {
    jest.clearAllMocks();

    mockPrisma = {
      profile: {
        findUnique: jest.fn().mockResolvedValue(mockProfile),
        create: jest.fn(),
        update: jest.fn().mockResolvedValue(mockProfile),
      },
    };

    service = new ProfileService(mockPrisma as unknown as PrismaService, mockStorage, mockIdentity);
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
  });
});
