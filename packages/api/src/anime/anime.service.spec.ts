import { BadRequestException } from '@nestjs/common';

import { IdentityContextService } from '../common/identity/identity-context.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { AnimeService } from './anime.service';

const mockIdentity = {
  getActiveUserByClerkIdOrThrow: jest.fn().mockResolvedValue({ id: 'u1', clerkUserId: 'c1' }),
  getActiveOrganizationByContextOrThrow: jest
    .fn()
    .mockResolvedValue({ id: 'o1', clerkOrgId: null }),
  assertMembershipOrThrow: jest.fn(),
} as unknown as IdentityContextService;

const makeEntry = (overrides: Record<string, unknown> = {}) => ({
  id: 'a1',
  userId: 'u1',
  organizationId: 'o1',
  title: 'Naruto',
  status: 'plan_to_watch' as const,
  currentEpisode: 0,
  totalEpisodes: null,
  score: null,
  notes: null,
  coverUrl: null,
  startDate: null,
  endDate: null,
  rewatchCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('AnimeService', () => {
  let service: AnimeService;
  let mockPrisma: {
    animeEntry: {
      findMany: jest.Mock;
      create: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      deleteMany: jest.Mock;
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockPrisma = {
      animeEntry: {
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    service = new AnimeService(mockPrisma as unknown as PrismaService, mockIdentity);
  });

  describe('list', () => {
    it('filters by status when provided', async () => {
      const entry = makeEntry({ status: 'watching' });
      mockPrisma.animeEntry.findMany.mockResolvedValue([entry]);

      const result = await service.list('c1', 'o1', 'watching');

      expect(mockPrisma.animeEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'watching' }),
        }),
      );
      expect(result).toHaveLength(1);
      expect(result[0]!.status).toBe('watching');
    });

    it('returns all entries when no status provided', async () => {
      const entries = [makeEntry(), makeEntry({ id: 'a2', status: 'completed' })];
      mockPrisma.animeEntry.findMany.mockResolvedValue(entries);

      const result = await service.list('c1', 'o1');

      expect(result).toHaveLength(2);
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

    it('creates entry successfully with valid title', async () => {
      const entry = makeEntry({ title: 'Naruto' });
      mockPrisma.animeEntry.create.mockResolvedValue(entry);

      const result = await service.create('c1', 'o1', { title: 'Naruto' });

      expect(result.title).toBe('Naruto');
      expect(mockPrisma.animeEntry.create).toHaveBeenCalled();
    });
  });
});
