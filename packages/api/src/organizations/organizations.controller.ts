import {
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

import {
  OrganizationsService,
  type OrganizationMembershipSummary,
} from './organizations.service';

@Controller('v1/organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get('me')
  myOrganizations(
    @Req() request: Request,
  ): Promise<OrganizationMembershipSummary[]> {
    const user = this.getRequestUser(request);

    return this.organizationsService.getMyOrganizations(user.sub);
  }

  @Post('bootstrap-personal')
  bootstrapPersonalOrganization(
    @Req() request: Request,
  ): Promise<OrganizationMembershipSummary> {
    const user = this.getRequestUser(request);

    return this.organizationsService.bootstrapPersonalOrganization(user.sub);
  }

  private getRequestUser(request: Request): { sub: string } {
    const sub = request.user?.sub;

    if (!sub) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    return { sub };
  }
}
