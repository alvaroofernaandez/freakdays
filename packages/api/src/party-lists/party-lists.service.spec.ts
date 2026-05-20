import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AnimeStatus } from '@prisma/client';

import { IdentityContextService } from '../common/identity/identity-context.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { PartyListsService } from './party-lists.service';

const mockIdentity = {
  getActiveUserByClerkIdOrThrow: jest.fn().mockResolvedValue({ id: 'u1', clerkUserId: 'c1' }),
  getActiveOrganizationByContextOrThrow: jest
    .fn()
    .mockResolvedValue({ id: 'o1', clerkOrgId: null }),
  assertMembershipOrThrow: jest.fn(),
} as unknown as IdentityContextService;

const makeParty = (overrides: Record<string, unknown> = {}) => ({
  id: 'party-1',
  organizationId: 'o1',
  ...overrides,
});

const makePartyMember = (overrides: Record<string, unknown> = {}) => ({
  role: 'member' as const,
  ...overrides,
});

const makeUser = () => ({
  clerkUserId: 'c1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
});

const makeListRecord = (overrides: Record<string, unknown> = {}) => ({
  id: 'list-1',
  partyId: 'party-1',
  name: 'Summer Anime',
  type: 'anime' as const,
  content: null,
  createdAt: new Date(),
  createdByUserId: 'u1',
  createdByUser: makeUser(),
  _count: { items: 0 },
  ...overrides,
});

describe('PartyListsService', () => {
  let service: PartyListsService;
  let mockPrisma: {
    party: { findUnique: jest.Mock };
    partyMember: { findUnique: jest.Mock };
    partyList: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    partyListItem: {
      create: jest.Mock;
      findUnique: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockPrisma = {
      party: {
        findUnique: jest.fn(),
      },
      partyMember: {
        findUnique: jest.fn(),
      },
      partyList: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
        update: jest.fn(),
      },
      partyListItem: {
        create: jest.fn(),
        findUnique: jest.fn().mockResolvedValue(null),
        delete: jest.fn(),
      },
    };

    service = new PartyListsService(mockPrisma as unknown as PrismaService, mockIdentity);
  });

  describe('createList', () => {
    it('asserts party membership before creating', async () => {
      mockPrisma.party.findUnique.mockResolvedValue(makeParty());
      mockPrisma.partyMember.findUnique.mockResolvedValue(makePartyMember());
      mockPrisma.partyList.create.mockResolvedValue(makeListRecord());

      await service.createList('c1', 'o1', 'party-1', { name: 'Summer Anime', listType: 'anime' });

      // Party and membership must be verified before the list is created.
      expect(mockPrisma.party.findUnique).toHaveBeenCalled();
      expect(mockPrisma.partyMember.findUnique).toHaveBeenCalled();
      expect(mockPrisma.partyList.create).toHaveBeenCalled();
    });

    it('throws NotFoundException when party does not exist', async () => {
      mockPrisma.party.findUnique.mockResolvedValue(null);

      await expect(
        service.createList('c1', 'o1', 'party-1', { name: 'Test', listType: 'anime' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when user is not a party member', async () => {
      mockPrisma.party.findUnique.mockResolvedValue(makeParty());
      mockPrisma.partyMember.findUnique.mockResolvedValue(null);

      await expect(
        service.createList('c1', 'o1', 'party-1', { name: 'Test', listType: 'anime' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException for invalid list type', async () => {
      mockPrisma.party.findUnique.mockResolvedValue(makeParty());
      mockPrisma.partyMember.findUnique.mockResolvedValue(makePartyMember());

      await expect(
        service.createList('c1', 'o1', 'party-1', {
          name: 'Test',
          listType: 'invalid_type' as never,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('addListItem', () => {
    it('uses plan_to_watch as default AnimeStatus when status is not provided', async () => {
      mockPrisma.party.findUnique.mockResolvedValue(makeParty());
      mockPrisma.partyMember.findUnique.mockResolvedValue(makePartyMember());
      mockPrisma.partyList.findUnique.mockResolvedValue({
        ...makeListRecord(),
        party: makeParty(),
      });

      const itemRecord = {
        id: 'item-1',
        listId: 'list-1',
        title: 'Naruto',
        status: AnimeStatus.plan_to_watch,
        currentEpisode: 0,
        totalEpisodes: null,
        score: null,
        notes: null,
        coverUrl: null,
        startDate: null,
        endDate: null,
        rewatchCount: 0,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdByUser: makeUser(),
        createdByUserId: 'u1',
      };
      mockPrisma.partyListItem.create.mockResolvedValue(itemRecord);

      const result = await service.addListItem('c1', 'o1', 'list-1', { title: 'Naruto' });

      expect(mockPrisma.partyListItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: AnimeStatus.plan_to_watch,
            title: 'Naruto',
          }),
        }),
      );
      expect(result.status).toBe(AnimeStatus.plan_to_watch);
    });

    it('uses provided AnimeStatus when valid', async () => {
      mockPrisma.party.findUnique.mockResolvedValue(makeParty());
      mockPrisma.partyMember.findUnique.mockResolvedValue(makePartyMember());
      mockPrisma.partyList.findUnique.mockResolvedValue({
        ...makeListRecord(),
        party: makeParty(),
      });

      const itemRecord = {
        id: 'item-2',
        listId: 'list-1',
        title: 'One Piece',
        status: AnimeStatus.watching,
        currentEpisode: 0,
        totalEpisodes: null,
        score: null,
        notes: null,
        coverUrl: null,
        startDate: null,
        endDate: null,
        rewatchCount: 0,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdByUser: makeUser(),
        createdByUserId: 'u1',
      };
      mockPrisma.partyListItem.create.mockResolvedValue(itemRecord);

      await service.addListItem('c1', 'o1', 'list-1', { title: 'One Piece', status: 'watching' });

      expect(mockPrisma.partyListItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: AnimeStatus.watching }),
        }),
      );
    });
  });

  describe('getListById', () => {
    it('throws NotFoundException when list does not exist', async () => {
      mockPrisma.partyList.findUnique.mockResolvedValue(null);

      await expect(service.getListById('c1', 'o1', 'nonexistent-list')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException when list belongs to a different organization', async () => {
      mockPrisma.partyList.findUnique.mockResolvedValue({
        ...makeListRecord(),
        items: [],
        party: { id: 'party-1', organizationId: 'other-org' }, // different org
      });

      await expect(service.getListById('c1', 'o1', 'list-1')).rejects.toThrow(NotFoundException);
    });
  });
});
