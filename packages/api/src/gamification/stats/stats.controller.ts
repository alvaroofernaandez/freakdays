import {
  Controller,
  Get,
  NotFoundException,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { ClerkJwtGuard } from '../../auth/guards/clerk-jwt.guard';
import { CurrentOrg } from '../../common/decorators/current-org.decorator';
import { StatsService } from './stats.service';

@ApiTags('stats')
@ApiBearerAuth()
@UseGuards(ClerkJwtGuard)
@Controller('v1/stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('me')
  async getMyStats(@Req() request: Request | string, @CurrentOrg() orgId?: string | null) {
    // Support both real NestJS request (with request.user.sub) and direct test calls
    const userId =
      typeof request === 'string' ? request : this.getRequestUser(request as Request).sub;
    const resolvedOrgId = typeof orgId === 'string' ? orgId : (orgId ?? '');

    const stats = await this.statsService.getStats(userId, resolvedOrgId);

    if (!stats) {
      throw new NotFoundException('Stats not found for this user');
    }

    return stats;
  }

  private getRequestUser(request: Request): { sub: string } {
    const sub = request.user?.sub;
    if (!sub) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return { sub };
  }
}
