import { ForbiddenException, Injectable } from '@nestjs/common';
import type { FeedEntry } from '@prisma/client';

import { PrismaService } from '../common/prisma/prisma.service';

export interface FeedPage {
  items: FeedEntry[];
  nextCursor: string | undefined;
}

@Injectable()
export class FeedService {
  constructor(private readonly prisma: PrismaService) {}

  async getPartyFeed(
    partyId: string,
    userId: string,
    cursor?: string,
    limit = 20,
  ): Promise<FeedPage> {
    // Verify membership
    const membership = await this.prisma.partyMember.findUnique({
      where: { partyId_userId: { partyId, userId } },
    });

    if (!membership) {
      throw new ForbiddenException('No tienes acceso al feed de esta party');
    }

    const take = limit + 1;

    const items = await this.prisma.feedEntry.findMany({
      where: { partyId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    let nextCursor: string | undefined;

    if (items.length > limit) {
      const extra = items.pop();
      nextCursor = extra?.id;
    }

    return { items, nextCursor };
  }
}
