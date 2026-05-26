import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PartyMemberRole } from '@prisma/client';

import { IdentityContextService } from '../common/identity/identity-context.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { PartyService } from './party.service';

const mockIdentity = {
  getActiveUserByClerkIdOrThrow: jest.fn().mockResolvedValue({ id: 'u1', clerkUserId: 'c1' }),
  getActiveOrganizationByContextOrThrow: jest
    .fn()
    .mockResolvedValue({ id: 'o1', clerkOrgId: null }),
  assertMembershipOrThrow: jest.fn(),
} as unknown as IdentityContextService;

const mockPartyWithOwnerAndMembers = (overrides: Record<string, unknown> = {}) => ({
  id: 'party-1',
  organizationId: 'o1',
  name: 'Test Party',
  description: null,
  inviteCode: 'ABC123',
  ownerId: 'u1',
  maxMembers: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
  owner: {
    id: 'u1',
    clerkUserId: 'c1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
  },
  members: [
    {
      id: 'm1',
      partyId: 'party-1',
      userId: 'u1',
      role: PartyMemberRole.owner,
      joinedAt: new Date(),
      user: {
        id: 'u1',
        clerkUserId: 'c1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        profile: {
          displayName: 'Test User',
          avatarUrl: null,
          username: 'testuser',
        },
      },
    },
  ],
  ...overrides,
});

describe('PartyService', () => {
  let service: PartyService;
  let mockPrisma: jest.Mocked<Pick<PrismaService, 'party' | 'partyMember' | 'user'>>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPrisma = {
      party: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      } as unknown as jest.Mocked<PrismaService['party']>,
      partyMember: {
        create: jest.fn(),
        delete: jest.fn(),
      } as unknown as jest.Mocked<PrismaService['partyMember']>,
      user: {
        findFirst: jest.fn(),
      } as unknown as jest.Mocked<PrismaService['user']>,
    };

    service = new PartyService(mockPrisma as unknown as PrismaService, mockIdentity);
  });

  describe('createParty', () => {
    it('creates a party and returns PartyView', async () => {
      const created = mockPartyWithOwnerAndMembers();
      (mockPrisma.party.findUnique as jest.Mock).mockResolvedValue(null);
      (mockPrisma.party.create as jest.Mock).mockResolvedValue(created);

      const result = await service.createParty('c1', 'o1', { name: 'Test Party' });

      expect(mockPrisma.party.create).toHaveBeenCalled();
      expect(result.name).toBe('Test Party');
      expect(result.members).toHaveLength(1);
    });

    it('throws BadRequestException when name is empty', async () => {
      await expect(service.createParty('c1', 'o1', { name: '   ' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('joinByCode', () => {
    it('throws BadRequestException when invite code is not 6 chars', async () => {
      await expect(service.joinByCode('c1', 'o1', { inviteCode: 'SHORT' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws NotFoundException when invite code not found', async () => {
      (mockPrisma.party.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.joinByCode('c1', 'o1', { inviteCode: 'XXXXXX' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ConflictException when already a member', async () => {
      const party = mockPartyWithOwnerAndMembers();
      (mockPrisma.party.findUnique as jest.Mock).mockResolvedValue(party);

      await expect(service.joinByCode('c1', 'o1', { inviteCode: 'ABC123' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('deleteParty', () => {
    it('deletes party when requester is owner', async () => {
      const party = mockPartyWithOwnerAndMembers();
      (mockPrisma.party.findUnique as jest.Mock).mockResolvedValue(party);
      (mockPrisma.party.delete as jest.Mock).mockResolvedValue(party);

      const result = await service.deleteParty('c1', 'o1', 'party-1');

      expect(result).toEqual({ success: true });
      expect(mockPrisma.party.delete).toHaveBeenCalledWith({ where: { id: 'party-1' } });
    });
  });
});
