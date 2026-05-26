import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { z } from 'zod';

import { LeaderboardService } from './leaderboard.service';

const leaderboardQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

@ApiTags('leaderboard')
@ApiBearerAuth()
@Controller('v1')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get('parties/:partyId/leaderboard')
  async getPartyLeaderboard(
    @Req() request: Request,
    @Param('partyId') partyId: string,
    @Query() rawQuery: Record<string, string>,
  ) {
    const userId = this.getRequestUserId(request);
    const parsed = leaderboardQuerySchema.safeParse(rawQuery);

    if (!parsed.success) {
      throw new BadRequestException(parsed.error.message);
    }

    const { page, limit } = parsed.data;

    return this.leaderboardService.getPartyLeaderboard(partyId, userId, page, limit);
  }

  @Get('leaderboard/global')
  async getGlobalLeaderboard(@Req() request: Request, @Query() rawQuery: Record<string, string>) {
    const userId = this.getRequestUserId(request);
    const parsed = leaderboardQuerySchema.safeParse(rawQuery);

    if (!parsed.success) {
      throw new BadRequestException(parsed.error.message);
    }

    const { page, limit } = parsed.data;

    return this.leaderboardService.getGlobalLeaderboard(userId, page, limit);
  }

  private getRequestUserId(request: Request): string {
    const sub = request.user?.sub;

    if (!sub) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    return sub;
  }
}
