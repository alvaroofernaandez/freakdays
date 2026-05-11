import { MembershipRole } from '@prisma/client';

import { IdentityContextService } from '../common/identity/identity-context.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { OrganizationsService } from './organizations.service';

describe('OrganizationsService', () => {
  const identityContext = {
    getActiveUserByClerkIdOrThrow: jest.fn(),
  } as unknown as IdentityContextService;

  const prisma = {
    membership: {
      findMany: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    organization: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  } as unknown as PrismaService;

  const tx = {
    organization: {
      create: jest.fn(),
    },
    membership: {
      create: jest.fn(),
    },
  };

  let service: OrganizationsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OrganizationsService(prisma, identityContext);

    (prisma.$transaction as jest.Mock).mockImplementation(async (callback: any) =>
      callback(tx),
    );
  });

  it('devuelve organización principal existente si ya hay memberships', async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({
      id: 'user-1',
    });

    (prisma.membership.findMany as jest.Mock).mockResolvedValue([
      {
        role: MembershipRole.member,
        organization: {
          id: 'org-member',
          clerkOrgId: 'clerk-org-member',
          slug: 'beta',
          name: 'Beta',
        },
      },
      {
        role: MembershipRole.owner,
        organization: {
          id: 'org-owner',
          clerkOrgId: 'clerk-org-owner',
          slug: 'alpha',
          name: 'Alpha',
        },
      },
    ]);

    const result = await service.bootstrapPersonalOrganization('clerk-user-1');

    expect(result).toEqual({
      organizationId: 'org-owner',
      clerkOrgId: 'clerk-org-owner',
      slug: 'alpha',
      name: 'Alpha',
      role: MembershipRole.owner,
    });

    expect(tx.organization.create).not.toHaveBeenCalled();
    expect(tx.membership.create).not.toHaveBeenCalled();
  });

  it('crea organización personal owner cuando no hay memberships', async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({
      id: 'user123456',
    });

    (prisma.membership.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      firstName: 'Nico',
      lastName: null,
    });
    (prisma.organization.findUnique as jest.Mock).mockResolvedValue(null);

    tx.organization.create.mockResolvedValue({
      id: 'org-new',
      clerkOrgId: null,
      slug: 'aventura-de-nico-user12',
      name: 'Aventura de Nico',
    });

    const result = await service.bootstrapPersonalOrganization('clerk-user-2');

    expect(prisma.organization.findUnique).toHaveBeenCalledWith({
      where: {
        slug: 'aventura-de-nico-user12',
      },
      select: {
        id: true,
      },
    });

    expect(tx.organization.create).toHaveBeenCalledWith({
      data: {
        clerkOrgId: null,
        slug: 'aventura-de-nico-user12',
        name: 'Aventura de Nico',
      },
      select: {
        id: true,
        clerkOrgId: true,
        slug: true,
        name: true,
      },
    });

    expect(tx.membership.create).toHaveBeenCalledWith({
      data: {
        userId: 'user123456',
        organizationId: 'org-new',
        role: MembershipRole.owner,
      },
    });

    expect(result).toEqual({
      organizationId: 'org-new',
      clerkOrgId: null,
      slug: 'aventura-de-nico-user12',
      name: 'Aventura de Nico',
      role: MembershipRole.owner,
    });
  });
});
