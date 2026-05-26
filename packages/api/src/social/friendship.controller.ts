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

const sendRequestBodySchema = z.object({
  targetUserId: z.string().min(1),
});

type SendRequestBody = z.infer<typeof sendRequestBodySchema>;

@ApiTags('friends')
@ApiBearerAuth()
@Controller('v1/friends')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

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

  private getCallerId(request: Request): string {
    const sub = request.user?.sub;

    if (!sub) {
      throw new UnauthorizedException('User not authenticated');
    }

    return sub;
  }
}
