import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

import { FriendFeedController } from '../friend-feed.controller';
import { FeedService } from '../feed.service';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeFeedPage = (items: object[] = [], nextCursor?: string) => ({
  items,
  nextCursor,
});

const mockFeedService = () =>
  ({
    getFriendFeed: jest.fn().mockResolvedValue(makeFeedPage()),
  }) as unknown as jest.Mocked<Pick<FeedService, 'getFriendFeed'>>;

const makeRequest = (sub?: string): Partial<Request> => ({
  user: sub ? ({ sub } as Request['user']) : undefined,
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FriendFeedController', () => {
  let controller: FriendFeedController;
  let feedService: ReturnType<typeof mockFeedService>;

  beforeEach(() => {
    feedService = mockFeedService();
    controller = new FriendFeedController(feedService as unknown as FeedService);
  });

  it('(a) returns feed page with items', async () => {
    const items = [{ id: 'fe-1', actorUserId: 'u-friend-1', type: 'level.up' }];
    (feedService.getFriendFeed as jest.Mock).mockResolvedValue(makeFeedPage(items));

    const result = await controller.getFriendFeed(makeRequest('u-caller') as Request, {});

    expect(result.items).toHaveLength(1);
  });

  it('(b) returns empty list when caller has no friends', async () => {
    (feedService.getFriendFeed as jest.Mock).mockResolvedValue(makeFeedPage([]));

    const result = await controller.getFriendFeed(makeRequest('u-caller') as Request, {});

    expect(result.items).toEqual([]);
  });

  it('(c) forwards cursor and limit to FeedService', async () => {
    await controller.getFriendFeed(makeRequest('u-caller') as Request, {
      cursor: 'fe-cursor-abc',
      limit: '5',
    });

    expect(feedService.getFriendFeed).toHaveBeenCalledWith('u-caller', 'fe-cursor-abc', 5);
  });

  it('(d) uses default limit=20 when limit not provided', async () => {
    await controller.getFriendFeed(makeRequest('u-caller') as Request, {});

    expect(feedService.getFriendFeed).toHaveBeenCalledWith('u-caller', undefined, 20);
  });

  it('(e) nextCursor is propagated from service', async () => {
    (feedService.getFriendFeed as jest.Mock).mockResolvedValue(
      makeFeedPage([{ id: 'fe-1' }], 'fe-next'),
    );

    const result = await controller.getFriendFeed(makeRequest('u-caller') as Request, {});

    expect(result.nextCursor).toBe('fe-next');
  });

  it('(f) throws UnauthorizedException when user is not authenticated', async () => {
    await expect(controller.getFriendFeed(makeRequest(undefined) as Request, {})).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('(g) throws BadRequestException on invalid query params', async () => {
    await expect(
      controller.getFriendFeed(makeRequest('u-caller') as Request, {
        limit: 'not-a-number',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
