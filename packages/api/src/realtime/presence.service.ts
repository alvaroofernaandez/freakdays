import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

import { parseRedisUrl } from '../events/redis.util';

// ---------------------------------------------------------------------------
// Key constants
// ---------------------------------------------------------------------------

const PRESENCE_ONLINE_KEY = 'presence:online' as const;

function buildConnKey(userId: string): string {
  return `presence:conn:${userId}`;
}

// ---------------------------------------------------------------------------
// Result shape for connect/disconnect
// ---------------------------------------------------------------------------

export interface PresenceTransitionResult {
  /** True when at least one socket remains connected after this call. */
  readonly isOnline: boolean;
  /** True when the user's overall online/offline status CHANGED in this call. */
  readonly transition: boolean;
}

// ---------------------------------------------------------------------------
// PresenceService
// ---------------------------------------------------------------------------

/**
 * Tracks per-user presence via two Redis data structures:
 *
 *   `presence:online`       — SET of online userIds
 *   `presence:conn:{userId}` — SET of active socketIds for that user
 *
 * Multi-socket reference counting: a user is online while ≥1 socket is open.
 * All Redis calls are wrapped in try/catch; any failure degrades to "offline"
 * without throwing — caller lifecycle is never blocked.
 *
 * Accepts an optional pre-built Redis client to allow unit testing without
 * real Redis or environment variables.
 */
@Injectable()
export class PresenceService {
  private readonly logger = new Logger(PresenceService.name);
  private readonly redis: Redis | null;

  /**
   * @param redisClient - Pre-built Redis client (for testing) or `undefined`
   *   (service builds its own from REDIS_URL). Pass `null` to explicitly
   *   disable Redis (all methods return offline).
   */
  constructor(redisClient?: Redis | null) {
    if (redisClient !== undefined) {
      // Accept injected client (including null = disabled)
      this.redis = redisClient ?? null;
    } else {
      // Build own client from env
      const conn = parseRedisUrl(process.env.REDIS_URL);
      if (conn) {
        try {
          this.redis = new Redis(conn);
          this.redis.on('error', (err: unknown) => {
            this.logger.debug(`PresenceService Redis error: ${String(err)}`);
          });
        } catch {
          this.redis = null;
        }
      } else {
        this.redis = null;
      }
    }
  }

  /**
   * Call on socket connect, AFTER the socket has been authenticated.
   * Adds the socket to the per-user conn SET, then adds the user to the global
   * online SET. Returns transition=true only on the very first socket (online
   * transition).
   */
  async onConnect(userId: string, socketId: string): Promise<PresenceTransitionResult> {
    if (!this.redis) {
      return { isOnline: false, transition: false };
    }

    try {
      const connKey = buildConnKey(userId);
      // SADD returns 1 if the member was added (new), 0 if it was already there
      const connAdded = await this.redis.sadd(connKey, socketId);

      if (connAdded === 0) {
        // Duplicate socketId — already tracked; no status change
        return { isOnline: true, transition: false };
      }

      // New socket: add userId to the global online set
      const onlineAdded = await this.redis.sadd(PRESENCE_ONLINE_KEY, userId);
      // onlineAdded === 1 → this is the first socket (online transition)
      return { isOnline: true, transition: onlineAdded === 1 };
    } catch (err: unknown) {
      this.logger.debug(`PresenceService.onConnect error: ${String(err)}`);
      return { isOnline: false, transition: false };
    }
  }

  /**
   * Call on socket disconnect.
   * Removes the socket from the per-user conn SET. If the SET is now empty,
   * removes the user from the global online SET and returns transition=true.
   */
  async onDisconnect(userId: string, socketId: string): Promise<PresenceTransitionResult> {
    if (!this.redis) {
      return { isOnline: false, transition: false };
    }

    try {
      const connKey = buildConnKey(userId);
      await this.redis.srem(connKey, socketId);
      const remaining = await this.redis.scard(connKey);

      if (remaining === 0) {
        // Last socket gone — remove from global online set
        await this.redis.srem(PRESENCE_ONLINE_KEY, userId);
        return { isOnline: false, transition: true };
      }

      return { isOnline: true, transition: false };
    } catch (err: unknown) {
      this.logger.debug(`PresenceService.onDisconnect error: ${String(err)}`);
      return { isOnline: false, transition: false };
    }
  }

  /**
   * Returns true if the user currently has at least one active socket.
   * Falls back to false on Redis failure.
   */
  async isOnline(userId: string): Promise<boolean> {
    if (!this.redis) return false;

    try {
      const results = await this.redis.smismember(PRESENCE_ONLINE_KEY, userId);
      return results[0] === 1;
    } catch (err: unknown) {
      this.logger.debug(`PresenceService.isOnline error: ${String(err)}`);
      return false;
    }
  }

  /**
   * Returns the subset of the provided userIds that are currently online.
   * Falls back to [] on Redis failure.
   */
  async whichOnline(userIds: string[]): Promise<string[]> {
    if (!this.redis || userIds.length === 0) return [];

    try {
      const results = await this.redis.smismember(PRESENCE_ONLINE_KEY, ...userIds);
      return userIds.filter((_, i) => results[i] === 1);
    } catch (err: unknown) {
      this.logger.debug(`PresenceService.whichOnline error: ${String(err)}`);
      return [];
    }
  }
}
