import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

import { parseRedisUrl } from '../events/redis.util';

// ---------------------------------------------------------------------------
// Key constants
// ---------------------------------------------------------------------------

const PRESENCE_ONLINE_KEY = 'presence:online' as const;

// ---------------------------------------------------------------------------
// Atomic disconnect Lua script
//
// Performs SREM(conn, socketId) + SCARD(conn) + conditional SREM(online, userId)
// in a single atomic operation so concurrent disconnects cannot both observe
// remaining===0 and both emit offline.
//
// Returns: [remaining_conn_count (number), online_removed (0 or 1)]
//   - remaining: 0 → no more sockets for this user
//   - online_removed: 1 → this call was the one that removed from presence:online
// ---------------------------------------------------------------------------
const DISCONNECT_LUA = `
local conn_key    = KEYS[1]
local online_key  = KEYS[2]
local socket_id   = ARGV[1]
local user_id     = ARGV[2]

redis.call('SREM', conn_key, socket_id)
local remaining = redis.call('SCARD', conn_key)

local online_removed = 0
if remaining == 0 then
  online_removed = redis.call('SREM', online_key, user_id)
end

return {remaining, online_removed}
` as const;

/**
 * TTL (seconds) for the per-user conn key.
 *
 * Self-healing contract:
 *   - Every `onConnect` and every `touch` call renews the TTL.
 *   - The gateway calls `touch` at ~TTL/2 interval per live socket so a tab
 *     open for hours never expires while it is connected.
 *   - If the process crashes, `onDisconnect` never runs, the key lapses after
 *     `PRESENCE_TTL` seconds, and `isOnline`/`whichOnline` read the conn key
 *     (SCARD) so the user auto-goes offline — no permanent ghost.
 */
const PRESENCE_TTL = parseInt(process.env.PRESENCE_TTL ?? '90', 10);

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
 *   `presence:online`       — SET of online userIds (kept in sync for bulk queries)
 *   `presence:conn:{userId}` — SET of active socketIds for that user (TTL-gated)
 *
 * Multi-socket reference counting: a user is online while ≥1 socket is open.
 *
 * Self-healing TTL model:
 *   The conn key carries a TTL (`PRESENCE_TTL` seconds). `onConnect` and
 *   `touch` both renew it. The gateway calls `touch` at ≤TTL/2 intervals
 *   for each live socket, so a long-lived session never expires. If the
 *   process dies without running `onDisconnect`, the key lapses naturally and
 *   the user reads offline on the next query — no permanent ghost.
 *
 * `isOnline`/`whichOnline` derive online status from the TTL-gated conn key
 * (SCARD > 0) so that a crashed pod's stale `presence:online` entry cannot
 * return a false-positive indefinitely.
 *
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
   * Adds the socket to the per-user conn SET, sets TTL on the conn key, then
   * adds the user to the global online SET.
   * Returns transition=true only on the very first socket (online transition).
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
        // Duplicate socketId — already tracked; no status change.
        // Still refresh TTL so the key doesn't lapse on a duplicate connect.
        await this.redis.expire(connKey, PRESENCE_TTL);
        return { isOnline: true, transition: false };
      }

      // New socket: apply TTL to the conn key so a crashed process auto-heals.
      await this.redis.expire(connKey, PRESENCE_TTL);

      // Add userId to the global online set
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
   * Uses an atomic Lua script (eval) to SREM(conn) + SCARD(conn) +
   * conditional SREM(online) in a single round-trip, eliminating the race
   * condition where two concurrent disconnects both observe remaining===0 and
   * both emit offline.
   *
   * Returns transition=true only when THIS call was the one that removed the
   * user from the online set (online_removed === 1).
   */
  async onDisconnect(userId: string, socketId: string): Promise<PresenceTransitionResult> {
    if (!this.redis) {
      return { isOnline: false, transition: false };
    }

    try {
      const connKey = buildConnKey(userId);
      // eval returns [remaining, online_removed]
      const raw = await this.redis.eval(
        DISCONNECT_LUA,
        2, // numkeys
        connKey,
        PRESENCE_ONLINE_KEY,
        socketId,
        userId,
      );

      const [remaining, onlineRemoved] = raw as [number, number];

      if (remaining === 0) {
        // This call (or a concurrent one) was the last socket.
        // transition=true only if THIS call did the online SREM.
        return { isOnline: false, transition: onlineRemoved === 1 };
      }

      return { isOnline: true, transition: false };
    } catch (err: unknown) {
      this.logger.debug(`PresenceService.onDisconnect error: ${String(err)}`);
      return { isOnline: false, transition: false };
    }
  }

  /**
   * Refreshes the TTL on the per-user conn key for a live session.
   *
   * The gateway calls this at ~TTL/2 intervals per connected socket so that a
   * long-lived session never expires while the socket is alive. A crashed
   * process stops calling touch; the key lapses after PRESENCE_TTL seconds and
   * the user auto-goes offline on the next read.
   */
  async touch(userId: string, socketId: string): Promise<void> {
    if (!this.redis) return;

    try {
      const connKey = buildConnKey(userId);
      // Only refresh if the socket is still in the set (guards against stale intervals)
      const isMember = await this.redis.scard(connKey);
      if (isMember > 0) {
        await this.redis.expire(connKey, PRESENCE_TTL);
      }
    } catch (err: unknown) {
      this.logger.debug(`PresenceService.touch error (userId=${userId}): ${String(err)}`);
    }
  }

  /**
   * Returns true if the user currently has at least one active socket.
   *
   * Derives online status from the TTL-gated conn key (SCARD > 0) so that a
   * crashed pod's stale `presence:online` entry cannot return a false-positive
   * indefinitely. Falls back to false on Redis failure.
   */
  async isOnline(userId: string): Promise<boolean> {
    if (!this.redis) return false;

    try {
      const connKey = buildConnKey(userId);
      const count = await this.redis.scard(connKey);
      return count > 0;
    } catch (err: unknown) {
      this.logger.debug(`PresenceService.isOnline error: ${String(err)}`);
      return false;
    }
  }

  /**
   * Returns the subset of the provided userIds that are currently online.
   *
   * Derives online status from the TTL-gated conn key (SCARD > 0) per user.
   * Falls back to [] on Redis failure.
   */
  async whichOnline(userIds: string[]): Promise<string[]> {
    if (!this.redis || userIds.length === 0) return [];

    try {
      // Pipeline SCARD calls for all requested users in one round-trip
      const pipeline = this.redis.pipeline();
      for (const uid of userIds) {
        pipeline.scard(buildConnKey(uid));
      }
      const results = await pipeline.exec();
      if (!results) return [];
      return userIds.filter((_, i) => {
        const [err, count] = results[i] as [Error | null, number];
        return err === null && count > 0;
      });
    } catch (err: unknown) {
      this.logger.debug(`PresenceService.whichOnline error: ${String(err)}`);
      return [];
    }
  }
}
