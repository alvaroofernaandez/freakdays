import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { z } from 'zod';

import { FriendshipService } from './friendship.service';
import { PresenceService } from '../realtime/presence.service';

/** Shape of the presence map returned by GET /v1/friends/presence */
type PresenceStatus = 'online' | 'offline';
type FriendsPresenceMap = Record<string, PresenceStatus>;

const sendRequestBodySchema = z.object({
  targetUserId: z.string().min(1),
});

type SendRequestBody = z.infer<typeof sendRequestBodySchema>;

@ApiTags('friends')
@ApiBearerAuth()
@Controller('v1/friends')
export class FriendshipController {
  constructor(
    private readonly friendshipService: FriendshipService,
    private readonly presenceService: PresenceService,
  ) {}

  /** POST /v1/friends/requests — send a friend request */
  @Post('requests')
  async sendRequest(@Req() request: Request, @Body() rawBody: unknown) {
    const callerId = this.getCallerId(request);
    const parsed = sendRequestBodySchema.safeParse(rawBody);

    if (!parsed.success) {
      throw new BadRequestException(parsed.error.message);
    }

    const { targetUserId } = parsed.data as SendRequestBody;

    return this.friendshipService.sendRequest(callerId, targetUserId);
  }

  /** POST /v1/friends/requests/:userId/accept — accept a pending request */
  @Post('requests/:userId/accept')
  async acceptRequest(@Req() request: Request, @Param('userId') otherUserId: string) {
    const callerId = this.getCallerId(request);
    return this.friendshipService.acceptRequest(callerId, otherUserId);
  }

  /** POST /v1/friends/requests/:userId/reject — reject a pending request */
  @Post('requests/:userId/reject')
  async rejectRequest(@Req() request: Request, @Param('userId') otherUserId: string) {
    const callerId = this.getCallerId(request);
    return this.friendshipService.rejectRequest(callerId, otherUserId);
  }

  /** DELETE /v1/friends/requests/:userId — cancel own pending request */
  @Delete('requests/:userId')
  async cancelRequest(@Req() request: Request, @Param('userId') otherUserId: string) {
    const callerId = this.getCallerId(request);
    return this.friendshipService.cancelRequest(callerId, otherUserId);
  }

  /** POST /v1/friends/:userId/block — block a user */
  @Post(':userId/block')
  async blockUser(@Req() request: Request, @Param('userId') targetUserId: string) {
    const callerId = this.getCallerId(request);
    return this.friendshipService.blockUser(callerId, targetUserId);
  }

  /** GET /v1/friends — list accepted friends */
  @Get()
  async listFriends(@Req() request: Request) {
    const callerId = this.getCallerId(request);
    return this.friendshipService.listFriends(callerId);
  }

  /** GET /v1/friends/requests/incoming — list incoming pending requests */
  @Get('requests/incoming')
  async listIncomingRequests(@Req() request: Request) {
    const callerId = this.getCallerId(request);
    return this.friendshipService.listIncomingRequests(callerId);
  }

  /** GET /v1/friends/requests/pending — list all pending requests (inbound + outbound) with direction labels */
  @Get('requests/pending')
  async listPendingRequests(@Req() request: Request) {
    const callerId = this.getCallerId(request);
    return this.friendshipService.listPendingRequests(callerId);
  }

  /**
   * GET /v1/friends/presence
   * Returns a presence map `{ userId: 'online' | 'offline' }` for the caller's
   * accepted friends. Non-friend user ids are never included (server-side filter).
   */
  @Get('presence')
  async getFriendsPresence(@Req() request: Request): Promise<FriendsPresenceMap> {
    const callerId = this.getCallerId(request);
    const friendIds = await this.friendshipService.listFriends(callerId);

    if (friendIds.length === 0) {
      return {};
    }

    const onlineIds = new Set(await this.presenceService.whichOnline(friendIds));

    return Object.fromEntries(
      friendIds.map((id) => [id, onlineIds.has(id) ? 'online' : 'offline'] as const),
    ) as FriendsPresenceMap;
  }

  private getCallerId(request: Request): string {
    const sub = request.user?.sub;

    if (!sub) {
      throw new UnauthorizedException('User not authenticated');
    }

    return sub;
  }
}
