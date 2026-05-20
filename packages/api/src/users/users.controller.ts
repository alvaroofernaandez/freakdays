import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { UsersService, type CurrentUserView } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  me(@Req() req: Request): Promise<CurrentUserView> {
    const clerkUserId = req.user?.sub ?? '';
    const orgId = req.orgId ?? null;
    return this.usersService.getCurrentUser(clerkUserId, orgId);
  }
}
