import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { IS_PUBLIC_KEY } from '../../auth/constants';
import { IdentityContextService } from '../identity/identity-context.service';

@Injectable()
export class OrgContextGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly identityContext: IdentityContextService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    // No authenticated user yet — leave it to the endpoint
    if (!request.user) {
      request.orgId = undefined;
      return true;
    }

    const headerOrgId = request.headers['x-org-id'];

    if (typeof headerOrgId === 'string' && headerOrgId.length > 0) {
      await this.validateMembership(request.user.sub, headerOrgId);
      request.orgId = headerOrgId;
      return true;
    }

    const jwtOrgId =
      typeof request.user.org_id === 'string' && request.user.org_id.length > 0
        ? request.user.org_id
        : null;

    if (jwtOrgId !== null) {
      request.orgId = jwtOrgId;
    }

    return true;
  }

  private async validateMembership(clerkUserId: string, orgContext: string): Promise<void> {
    let userId: string;

    try {
      const user = await this.identityContext.getActiveUserByClerkIdOrThrow(clerkUserId);
      userId = user.id;
    } catch {
      // User not provisioned — let the downstream service decide
      return;
    }

    let organizationId: string;

    try {
      const org = await this.identityContext.getActiveOrganizationByContextOrThrow(orgContext);
      organizationId = org.id;
    } catch {
      throw new BadRequestException(
        'La organización indicada en x-org-id no existe o está inactiva',
      );
    }

    try {
      await this.identityContext.assertMembershipOrThrow(userId, organizationId);
    } catch {
      throw new ForbiddenException(
        'El usuario no tiene membresía activa en la organización indicada',
      );
    }
  }
}
