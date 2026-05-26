import { Injectable, Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';

import { ClerkJwtStrategy } from '../auth/strategies/clerk-jwt.strategy';

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

  constructor(private readonly strategy: ClerkJwtStrategy) {}

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

      this.logger.debug(
        `RealtimeGateway: socket=${client.id} authenticated userId=${userId} orgId=${orgId}`,
      );
    } catch {
      this.logger.debug(
        `RealtimeGateway: connection rejected — token validation failed (socket=${client.id})`,
      );
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`RealtimeGateway: socket=${client.id} disconnected`);
  }

  emitToUser(userId: string, event: string, payload: unknown): void {
    this.server.to(`user:${userId}`).emit(event, payload);
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
