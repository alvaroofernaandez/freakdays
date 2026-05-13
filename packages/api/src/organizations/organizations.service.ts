import { Injectable } from '@nestjs/common';
import { MembershipRole } from '@prisma/client';

import { IdentityContextService } from '../common/identity/identity-context.service';
import { PrismaService } from '../common/prisma/prisma.service';

export interface OrganizationMembershipSummary {
  organizationId: string;
  clerkOrgId: string | null;
  slug: string;
  name: string;
  role: 'owner' | 'admin' | 'member';
}

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly identityContext: IdentityContextService,
  ) {}

  async getMyOrganizations(clerkUserId: string): Promise<OrganizationMembershipSummary[]> {
    const user = await this.identityContext.getActiveUserByClerkIdOrThrow(clerkUserId);
    const memberships = await this.findActiveMemberships(user.id);

    return this.sortMemberships(this.mapMemberships(memberships));
  }

  async bootstrapPersonalOrganization(clerkUserId: string): Promise<OrganizationMembershipSummary> {
    const user = await this.ensureUserForBootstrap(clerkUserId);
    const memberships = await this.findActiveMemberships(user.id);
    const primaryMembership = this.sortMemberships(this.mapMemberships(memberships))[0];

    if (primaryMembership) {
      return primaryMembership;
    }

    const userProfile = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        firstName: true,
        lastName: true,
      },
    });

    const organizationName = this.buildPersonalOrganizationName(
      userProfile?.firstName ?? null,
      userProfile?.lastName ?? null,
      user.id,
    );
    const organizationSlug = await this.buildUniquePersonalSlug(organizationName, user.id);

    const organization = await this.prisma.$transaction(async (tx) => {
      const createdOrganization = await tx.organization.create({
        data: {
          clerkOrgId: null,
          slug: organizationSlug,
          name: organizationName,
        },
        select: {
          id: true,
          clerkOrgId: true,
          slug: true,
          name: true,
        },
      });

      await tx.membership.create({
        data: {
          userId: user.id,
          organizationId: createdOrganization.id,
          role: MembershipRole.owner,
        },
      });

      return createdOrganization;
    });

    return {
      organizationId: organization.id,
      clerkOrgId: organization.clerkOrgId,
      slug: organization.slug,
      name: organization.name,
      role: MembershipRole.owner,
    };
  }

  private async ensureUserForBootstrap(clerkUserId: string) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        clerkUserId,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      return existingUser;
    }

    return this.prisma.user.create({
      data: {
        clerkUserId,
      },
      select: {
        id: true,
      },
    });
  }

  private async findActiveMemberships(userId: string) {
    return this.prisma.membership.findMany({
      where: {
        userId,
        organization: {
          isActive: true,
        },
      },
      select: {
        role: true,
        organization: {
          select: {
            id: true,
            clerkOrgId: true,
            slug: true,
            name: true,
          },
        },
      },
    });
  }

  private mapMemberships(
    memberships: {
      role: MembershipRole;
      organization: {
        id: string;
        clerkOrgId: string | null;
        slug: string;
        name: string;
      };
    }[],
  ): OrganizationMembershipSummary[] {
    return memberships.map((membership) => ({
      organizationId: membership.organization.id,
      clerkOrgId: membership.organization.clerkOrgId,
      slug: membership.organization.slug,
      name: membership.organization.name,
      role: membership.role,
    }));
  }

  private sortMemberships(
    memberships: OrganizationMembershipSummary[],
  ): OrganizationMembershipSummary[] {
    const roleWeight: Record<MembershipRole, number> = {
      owner: 0,
      admin: 1,
      member: 2,
    };

    return [...memberships].sort((a, b) => {
      const roleDiff = roleWeight[a.role] - roleWeight[b.role];

      if (roleDiff !== 0) {
        return roleDiff;
      }

      return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
    });
  }

  private buildPersonalOrganizationName(
    firstName: string | null,
    lastName: string | null,
    userId: string,
  ): string {
    const normalizedFirstName = firstName?.trim() ?? '';
    const normalizedLastName = lastName?.trim() ?? '';
    const fullName = [normalizedFirstName, normalizedLastName]
      .filter((value) => value.length > 0)
      .join(' ')
      .trim();

    if (fullName.length > 0) {
      return `Aventura de ${fullName}`;
    }

    const userToken = userId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
    const suffix = userToken.length > 0 ? userToken : 'usuario';

    return `Aventura de ${suffix}`;
  }

  private async buildUniquePersonalSlug(organizationName: string, userId: string): Promise<string> {
    const baseName = this.slugify(organizationName);
    const userToken = userId
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase()
      .slice(0, 6);
    const suffix = userToken.length > 0 ? userToken : 'usr';
    const baseSlug = `${baseName}-${suffix}`;

    let candidate = baseSlug;
    let sequence = 1;

    while (true) {
      const existing = await this.prisma.organization.findUnique({
        where: {
          slug: candidate,
        },
        select: {
          id: true,
        },
      });

      if (!existing) {
        return candidate;
      }

      sequence += 1;
      candidate = `${baseSlug}-${sequence}`;
    }
  }

  private slugify(value: string): string {
    const normalized = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-|-$/g, '');

    return normalized.length > 0 ? normalized : 'aventura';
  }
}
