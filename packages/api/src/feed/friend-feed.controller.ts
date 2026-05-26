import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { z } from 'zod';

import { FeedService } from './feed.service';

const friendFeedQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

@ApiTags('feed')
@ApiBearerAuth()
@Controller('v1/feed')
export class FriendFeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get('friends')
  async getFriendFeed(@Req() request: Request, @Query() rawQuery: Record<string, string>) {
    const userId = this.getRequestUserId(request);

    const parsed = friendFeedQuerySchema.safeParse(rawQuery);

    if (!parsed.success) {
      throw new BadRequestException(parsed.error.message);
    }

    const { cursor, limit } = parsed.data;

    return this.feedService.getFriendFeed(userId, cursor, limit);
  }

  private getRequestUserId(request: Request): string {
    const sub = request.user?.sub;

    if (!sub) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    return sub;
  }
}
