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

import { FeedService } from './feed.service';

const feedQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

@ApiTags('feed')
@ApiBearerAuth()
@Controller('v1/parties')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get(':partyId/feed')
  async getPartyFeed(
    @Req() request: Request,
    @Param('partyId') partyId: string,
    @Query() rawQuery: Record<string, string>,
  ) {
    const userId = this.getRequestUserId(request);
    const parsed = feedQuerySchema.safeParse(rawQuery);

    if (!parsed.success) {
      throw new BadRequestException(parsed.error.message);
    }

    const { cursor, limit } = parsed.data;

    return this.feedService.getPartyFeed(partyId, userId, cursor, limit);
  }

  private getRequestUserId(request: Request): string {
    const sub = request.user?.sub;

    if (!sub) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    return sub;
  }
}
