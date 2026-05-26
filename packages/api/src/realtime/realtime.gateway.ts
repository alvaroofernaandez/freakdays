import { Injectable, Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';

import { WIRE_EVENTS } from '@freakdays/domain';
import type { PresenceChangedPayload } from '@freakdays/domain';

import { ClerkJwtStrategy } from '../auth/strategies/clerk-jwt.strategy';
import { PrismaService } from '../common/prisma/prisma.service';
import { FriendshipService } from '../social/friendship.service';
import { PresenceService } from './presence.service';
import type { PresenceTransitionResult } from './presence.service';

/**
 * Interval at which a connected socket refreshes the presence TTL.
 * Set to TTL/2 so a live session never expires, but a crashed pod lets the
 * key lapse within one full TTL period.
 * Defaults to 45s (half of the default PRESENCE_TTL=90s).
 */
const PRESENCE_HEARTBEAT_INTERVAL_MS = parseInt(
  process.env.PRESENCE_HEARTBEAT_INTERVAL_MS ?? '45000',
  10,
);

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
      : '*',
    credentials: true,
  },
})
@Injectable()
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  /** Per-socket heartbeat timer handles, keyed by socketId. */
  private readonly heartbeatTimers = new Map<string, ReturnType<typeof setInterval>>();

  constructor(
    private readonly strategy: ClerkJwtStrategy,
    private readonly prisma: PrismaService,
    private readonly presenceService: PresenceService,
    private readonly friendshipService: FriendshipService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    const token = this.extractToken(client);

    if (!token) {
      this.logger.debug(`RealtimeGateway: connection rejected — no token (socket=${client.id})`);
      client.disconnect(true);
      return;
    }

    try {
      const payload = await this.strategy.validateToken(token);
      const userId: string = payload.sub;
      const orgId: string | null = payload.org_id ?? null;

      client.data = { userId, orgId };
      await client.join(`user:${userId}`);

      if (orgId) {
        await client.join(`org:${orgId}`);
      }

      // Join verified party rooms for this user
      const memberships = await this.prisma.partyMember.findMany({
        where: { userId },
        select: { partyId: true },
      });

      for (const { partyId } of memberships) {
        await client.join(`party:${partyId}`);
      }

      this.logger.debug(
        `RealtimeGateway: socket=${client.id} authenticated userId=${userId} orgId=${orgId} parties=${memberships.length}`,
      );

      // Presence: mark socket online, emit PRESENCE_CHANGED on real transition
      const result = await this.presenceService.onConnect(userId, client.id);
      if (result.transition) {
        await this.emitPresenceChanged(userId, true);
      }

      // TTL heartbeat: periodically refresh the conn-key TTL so a live session
      // never auto-expires. The interval is cleared in handleDisconnect.
      const socketId = client.id;
      const timer = setInterval(() => {
        void this.presenceService.touch(userId, socketId);
      }, PRESENCE_HEARTBEAT_INTERVAL_MS);
      this.heartbeatTimers.set(socketId, timer);
    } catch {
      this.logger.debug(
        `RealtimeGateway: connection rejected — token validation failed (socket=${client.id})`,
      );
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket): Promise<void> {
    this.logger.debug(`RealtimeGateway: socket=${client.id} disconnected`);

    // Clear the per-socket heartbeat timer first so touch() stops immediately.
    const timer = this.heartbeatTimers.get(client.id);
    if (timer !== undefined) {
      clearInterval(timer);
      this.heartbeatTimers.delete(client.id);
    }

    const userId = client.data?.userId as string | undefined;
    if (!userId) {
      // Socket was never authenticated — nothing to clean up
      return;
    }

    try {
      const result: PresenceTransitionResult = await this.presenceService.onDisconnect(
        userId,
        client.id,
      );
      if (result.transition) {
        await this.emitPresenceChanged(userId, false);
      }
    } catch {
      // Presence cleanup failure must never surface to the disconnect lifecycle
      this.logger.debug(`RealtimeGateway: presence cleanup error for userId=${userId}`);
    }
  }

  emitToUser(userId: string, event: string, payload: unknown): void {
    this.server.to(`user:${userId}`).emit(event, payload);
  }

  emitToParty(partyId: string, event: string, payload: unknown): void {
    this.server.to(`party:${partyId}`).emit(event, payload);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  /**
   * Emits PRESENCE_CHANGED to all accepted friends of userId.
   * Best-effort: errors are logged and swallowed.
   */
  private async emitPresenceChanged(userId: string, online: boolean): Promise<void> {
    try {
      const friendIds = await this.friendshipService.listFriends(userId);
      if (friendIds.length === 0) return;

      const presencePayload: PresenceChangedPayload = {
        userId,
        online,
        at: new Date().toISOString(),
      };

      for (const friendId of friendIds) {
        this.server.to(`user:${friendId}`).emit(WIRE_EVENTS.PRESENCE_CHANGED, presencePayload);
      }
    } catch {
      this.logger.debug(`RealtimeGateway: emitPresenceChanged error for userId=${userId}`);
    }
  }

  private extractToken(client: Socket): string | null {
    const authToken = client.handshake.auth?.token as string | undefined;

    if (typeof authToken === 'string' && authToken.length > 0) {
      return authToken;
    }

    const authHeader = client.handshake.headers?.authorization as string | undefined;

    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice('Bearer '.length);
      return token.length > 0 ? token : null;
    }

    return null;
  }
}
