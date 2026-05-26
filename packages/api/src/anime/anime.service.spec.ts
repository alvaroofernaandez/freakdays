import { BadRequestException } from '@nestjs/common';

import { IdentityContextService } from '../common/identity/identity-context.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { EventBusService } from '../events/event-bus.service';
import { EVENT_TYPES } from '../events/event-types';
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
    outboxEvent: { create: jest.Mock };
    $transaction: jest.Mock;
  };
  let mockEventBus: { emit: jest.Mock; buildEvent: jest.Mock };

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
      outboxEvent: { create: jest.fn().mockResolvedValue({}) },
      $transaction: jest
        .fn()
        .mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => cb(mockPrisma)),
    };

    mockEventBus = {
      emit: jest.fn().mockResolvedValue(undefined),
      buildEvent: jest.fn().mockReturnValue({
        eventId: 'mock-evt-id',
        type: EVENT_TYPES.ANIME_PROGRESSED,
        aggregateId: 'a1',
        orgId: 'o1',
        payload: {},
        occurredAt: new Date(),
      }),
    };

    service = new AnimeService(
      mockPrisma as unknown as PrismaService,
      mockIdentity,
      mockEventBus as unknown as EventBusService,
    );
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

  describe('update — emit events', () => {
    it('emits ANIME_PROGRESSED when currentEpisode increases', async () => {
      const existing = makeEntry({ currentEpisode: 5, status: 'watching' });
      const updated = makeEntry({ currentEpisode: 6, status: 'watching' });
      mockPrisma.animeEntry.findFirst.mockResolvedValue(existing);
      mockPrisma.animeEntry.update.mockResolvedValue(updated);

      await service.update('c1', 'o1', 'a1', { currentEpisode: 6 });

      expect(mockEventBus.buildEvent).toHaveBeenCalledWith(
        EVENT_TYPES.ANIME_PROGRESSED,
        'a1',
        expect.objectContaining({ userId: 'u1', animeId: 'a1' }),
        'o1',
      );
      expect(mockEventBus.emit).toHaveBeenCalledTimes(1);
    });

    it('emits ANIME_COMPLETED when status changes to completed', async () => {
      const existing = makeEntry({ currentEpisode: 12, status: 'watching' });
      const updated = makeEntry({ currentEpisode: 12, status: 'completed' });
      mockPrisma.animeEntry.findFirst.mockResolvedValue(existing);
      mockPrisma.animeEntry.update.mockResolvedValue(updated);

      await service.update('c1', 'o1', 'a1', { status: 'completed' });

      expect(mockEventBus.buildEvent).toHaveBeenCalledWith(
        EVENT_TYPES.ANIME_COMPLETED,
        'a1',
        expect.objectContaining({ userId: 'u1', animeId: 'a1' }),
        'o1',
      );
      expect(mockEventBus.emit).toHaveBeenCalledTimes(1);
    });

    it('does NOT emit event when no episode change and status unchanged', async () => {
      const existing = makeEntry({ currentEpisode: 5, status: 'watching' });
      const updatedEntry = makeEntry({
        currentEpisode: 5,
        status: 'watching',
        notes: 'Great show',
      });
      mockPrisma.animeEntry.findFirst.mockResolvedValue(existing);
      mockPrisma.animeEntry.update.mockResolvedValue(updatedEntry);

      await service.update('c1', 'o1', 'a1', { notes: 'Great show' });

      expect(mockEventBus.emit).not.toHaveBeenCalled();
    });
  });
});
