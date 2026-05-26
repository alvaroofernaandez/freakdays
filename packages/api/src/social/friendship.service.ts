import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Friendship } from '@prisma/client';
import { FriendshipStatus } from '@prisma/client';

import { PrismaService } from '../common/prisma/prisma.service';
import { normalizeFriendshipPair } from './normalize-friendship-pair';
import { PENDING_DIRECTION, type PendingRequestWithDirection } from './social.types';

@Injectable()
export class FriendshipService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Initiates a friend request from initiatorId to targetUserId.
   * Direction normalization ensures the canonical pair is stored (min=requesterId).
   * Idempotent: if a record already exists in any non-blocked status, returns it.
   * Blocked pair → ForbiddenException.
   */
  async sendRequest(initiatorId: string, targetUserId: string): Promise<Friendship> {
    const pair = normalizeFriendshipPair(initiatorId, targetUserId);

    if (!pair) {
      throw new BadRequestException('Cannot send a friend request to yourself');
    }

    const existing = await this.prisma.friendship.findUnique({
      where: { requesterId_addresseeId: pair },
    });

    if (existing) {
      if (existing.status === FriendshipStatus.blocked) {
        throw new ForbiddenException('Cannot send a friend request to a blocked user');
      }
      // pending or accepted → idempotent no-op
      return existing;
    }

    return this.prisma.friendship.create({
      data: {
        requesterId: pair.requesterId,
        addresseeId: pair.addresseeId,
        initiatorId,
        status: FriendshipStatus.pending,
      },
    });
  }

  /**
   * Accepts a pending friendship request.
   * Only the NON-initiator may accept.
   * Row not found → NotFoundException.
   * Caller is initiator → ForbiddenException.
   * Status is not pending → ConflictException.
   */
  async acceptRequest(callerId: string, otherUserId: string): Promise<Friendship> {
    const row = await this.loadFriendshipOrThrow(callerId, otherUserId);

    this.assertCanAcceptOrReject(callerId, row, 'accept');

    if (row.status !== FriendshipStatus.pending) {
      throw new ConflictException('Only pending friendships can be accepted');
    }

    return this.prisma.friendship.update({
      where: { id: row.id },
      data: { status: FriendshipStatus.accepted },
    });
  }

  /**
   * Rejects a pending friendship request (non-initiator rejects).
   * Deletes the row so a fresh request is possible later.
   */
  async rejectRequest(callerId: string, otherUserId: string): Promise<void> {
    const row = await this.loadFriendshipOrThrow(callerId, otherUserId);

    if (row.status !== FriendshipStatus.pending) {
      throw new ConflictException('Only pending friendships can be rejected');
    }

    this.assertCanAcceptOrReject(callerId, row, 'reject');

    await this.prisma.friendship.delete({ where: { id: row.id } });
  }

  /**
   * Cancels a pending request that the caller initiated.
   * Deletes the row.
   */
  async cancelRequest(callerId: string, otherUserId: string): Promise<void> {
    const row = await this.loadFriendshipOrThrow(callerId, otherUserId);

    if (row.initiatorId !== callerId) {
      throw new ForbiddenException('Only the initiator can cancel the request');
    }

    if (row.status !== FriendshipStatus.pending) {
      throw new ConflictException('Only pending friendships can be cancelled');
    }

    await this.prisma.friendship.delete({ where: { id: row.id } });
  }

  /**
   * Blocks a user. Either party can block.
   * If a friendship already exists → update to blocked.
   * If no friendship exists → upsert a new blocked record.
   * Blocker tracked via initiatorId.
   */
  async blockUser(callerId: string, targetUserId: string): Promise<Friendship> {
    const pair = normalizeFriendshipPair(callerId, targetUserId);

    if (!pair) {
      throw new BadRequestException('Cannot block yourself');
    }

    const existing = await this.prisma.friendship.findUnique({
      where: { requesterId_addresseeId: pair },
    });

    if (existing) {
      return this.prisma.friendship.update({
        where: { id: existing.id },
        data: { status: FriendshipStatus.blocked, initiatorId: callerId },
      });
    }

    return this.prisma.friendship.upsert({
      where: { requesterId_addresseeId: pair },
      create: {
        requesterId: pair.requesterId,
        addresseeId: pair.addresseeId,
        initiatorId: callerId,
        status: FriendshipStatus.blocked,
      },
      update: {
        status: FriendshipStatus.blocked,
        initiatorId: callerId,
      },
    });
  }

  /**
   * Returns the user ids of accepted friends for userId.
   */
  async listFriends(userId: string): Promise<string[]> {
    const rows = await this.prisma.friendship.findMany({
      where: {
        status: FriendshipStatus.accepted,
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
    });

    return rows.map((row) => (row.requesterId === userId ? row.addresseeId : row.requesterId));
  }

  /**
   * Returns pending inbound friendship requests for userId (where userId is non-initiator).
   */
  async listIncomingRequests(userId: string): Promise<Friendship[]> {
    return this.prisma.friendship.findMany({
      where: {
        status: FriendshipStatus.pending,
        OR: [
          { addresseeId: userId, initiatorId: { not: userId } },
          { requesterId: userId, initiatorId: { not: userId } },
        ],
      },
    });
  }

  /**
   * Returns all pending requests for userId — both inbound and outbound —
   * each tagged with a direction label.
   * - 'outgoing': caller is the initiator
   * - 'incoming': caller is not the initiator
   */
  async listPendingRequests(userId: string): Promise<PendingRequestWithDirection[]> {
    const rows = await this.prisma.friendship.findMany({
      where: {
        status: FriendshipStatus.pending,
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
    });

    return rows.map((row) => ({
      ...row,
      direction:
        row.initiatorId === userId ? PENDING_DIRECTION.outgoing : PENDING_DIRECTION.incoming,
    }));
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async loadFriendshipOrThrow(callerId: string, otherUserId: string): Promise<Friendship> {
    const pair = normalizeFriendshipPair(callerId, otherUserId);

    if (!pair) {
      throw new BadRequestException('Invalid user ids');
    }

    const row = await this.prisma.friendship.findUnique({
      where: { requesterId_addresseeId: pair },
    });

    if (!row) {
      throw new NotFoundException('Friendship not found');
    }

    return row;
  }

  /**
   * Authz guard: only the NON-initiator may accept or reject.
   * The initiator must use cancelRequest instead.
   */
  private assertCanAcceptOrReject(
    callerId: string,
    friendship: Friendship,
    action: 'accept' | 'reject',
  ): void {
    if (friendship.initiatorId === callerId) {
      throw new ForbiddenException(`Only the non-initiator can ${action} a friend request`);
    }

    // Also verify caller is actually involved in this friendship
    if (friendship.requesterId !== callerId && friendship.addresseeId !== callerId) {
      throw new ForbiddenException('Not authorized to modify this friendship');
    }
  }
}
