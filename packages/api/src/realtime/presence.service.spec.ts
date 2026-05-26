/**
 * Unit tests for PresenceService — multi-socket reference counting and graceful
 * Redis degradation.
 *
 * Redis is mocked at the constructor level: we provide a fake client that stubs
 * sadd, srem, scard, and smembers so we can assert transition logic without a
 * live Redis instance.
 */

// ---------------------------------------------------------------------------
// Types for the mock Redis client used in this test file.
// ---------------------------------------------------------------------------

interface MockRedisClient {
  sadd: jest.Mock<Promise<number>, [key: string, member: string]>;
  srem: jest.Mock<Promise<number>, [key: string, member: string]>;
  scard: jest.Mock<Promise<number>, [key: string]>;
  smembers: jest.Mock<Promise<string[]>, [key: string]>;
  smismember: jest.Mock<Promise<Array<0 | 1>>, [key: string, ...members: string[]]>;
  expire: jest.Mock<Promise<number>, [key: string, seconds: number]>;
  eval: jest.Mock<Promise<unknown>, unknown[]>;
}

const makeMockRedis = (): MockRedisClient => ({
  sadd: jest.fn(),
  srem: jest.fn(),
  scard: jest.fn(),
  smembers: jest.fn(),
  smismember: jest.fn(),
  expire: jest.fn().mockResolvedValue(1),
  eval: jest.fn(),
});

// ---------------------------------------------------------------------------
// The subject under test is NOT yet implemented — these tests will fail (RED).
// ---------------------------------------------------------------------------
import { PresenceService } from './presence.service';

describe('PresenceService — multi-socket ref-counting', () => {
  let redis: MockRedisClient;
  let svc: PresenceService;

  beforeEach(() => {
    redis = makeMockRedis();
    // Inject the mock client directly; PresenceService accepts an optional
    // pre-built Redis client to enable testability without env vars.
    svc = new PresenceService(redis as unknown as import('ioredis').Redis);
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // onConnect
  // ──────────────────────────────────────────────────────────────────────────

  describe('onConnect', () => {
    it('first socket → SADD conn + SADD online; returns isOnline=true transition=true', async () => {
      // SADD conn returns 1 (new member), SADD online returns 1 (new member)
      redis.sadd.mockResolvedValueOnce(1).mockResolvedValueOnce(1);

      const result = await svc.onConnect('user-a', 'socket-1');

      expect(redis.sadd).toHaveBeenNthCalledWith(1, 'presence:conn:user-a', 'socket-1');
      expect(redis.sadd).toHaveBeenNthCalledWith(2, 'presence:online', 'user-a');
      expect(result).toEqual({ isOnline: true, transition: true });
    });

    it('second socket for same user → SADD conn=1 but online SADD=0 (already there); transition=false', async () => {
      // First sadd (conn set) returns 1 (new socket), second sadd (online set) returns 0 (already online)
      redis.sadd.mockResolvedValueOnce(1).mockResolvedValueOnce(0);

      const result = await svc.onConnect('user-a', 'socket-2');

      expect(result).toEqual({ isOnline: true, transition: false });
    });

    it('duplicate socketId (same socket re-connects) → SADD conn=0; no online SADD; transition=false', async () => {
      // SADD conn returns 0 (socket already in set — duplicate)
      redis.sadd.mockResolvedValueOnce(0);

      const result = await svc.onConnect('user-a', 'socket-1');

      // Because sadd returned 0 (duplicate), we skip the online SADD
      expect(redis.sadd).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ isOnline: true, transition: false });
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // onDisconnect
  // ──────────────────────────────────────────────────────────────────────────

  describe('onDisconnect', () => {
    it('last socket disconnects → SREM conn; SCARD=0 → SREM online; transition=true', async () => {
      redis.srem.mockResolvedValueOnce(1); // removed from conn set
      redis.scard.mockResolvedValueOnce(0); // conn set now empty
      redis.srem.mockResolvedValueOnce(1); // removed from online set

      const result = await svc.onDisconnect('user-a', 'socket-1');

      expect(redis.srem).toHaveBeenNthCalledWith(1, 'presence:conn:user-a', 'socket-1');
      expect(redis.scard).toHaveBeenCalledWith('presence:conn:user-a');
      expect(redis.srem).toHaveBeenNthCalledWith(2, 'presence:online', 'user-a');
      expect(result).toEqual({ isOnline: false, transition: true });
    });

    it('first of two sockets disconnects → SREM conn; SCARD=1 → no online SREM; transition=false', async () => {
      redis.srem.mockResolvedValueOnce(1); // removed from conn set
      redis.scard.mockResolvedValueOnce(1); // conn set still has 1 socket

      const result = await svc.onDisconnect('user-a', 'socket-1');

      expect(redis.srem).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ isOnline: true, transition: false });
    });

    it('unknown socketId (already removed) → SREM conn returns 0; SCARD=0 → still marks offline; transition=true', async () => {
      // The socket was not in the set (crashed pod re-delivery)
      redis.srem.mockResolvedValueOnce(0); // not found in conn set
      redis.scard.mockResolvedValueOnce(0); // no more sockets for user
      redis.srem.mockResolvedValueOnce(1); // cleaned up online set

      const result = await svc.onDisconnect('user-a', 'socket-ghost');

      expect(result).toEqual({ isOnline: false, transition: true });
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // isOnline / whichOnline
  // ──────────────────────────────────────────────────────────────────────────

  describe('isOnline', () => {
    it('user with active conn key (SCARD > 0) → true', async () => {
      // isOnline now derives from the TTL-gated conn key (SCARD), not presence:online
      redis.scard.mockResolvedValueOnce(1);
      expect(await svc.isOnline('user-a')).toBe(true);
      expect(redis.scard).toHaveBeenCalledWith('presence:conn:user-a');
    });

    it('user with empty conn key (SCARD = 0) → false (lapsed or never connected)', async () => {
      redis.scard.mockResolvedValueOnce(0);
      expect(await svc.isOnline('user-a')).toBe(false);
    });
  });

  describe('whichOnline', () => {
    it('returns subset of ids whose conn keys are non-empty', async () => {
      // whichOnline pipelines SCARD per user; simulate pipeline.exec results
      const mockPipeline = {
        scard: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          [null, 1],
          [null, 0],
          [null, 2],
        ]),
      };
      (redis as unknown as { pipeline: jest.Mock }).pipeline = jest
        .fn()
        .mockReturnValue(mockPipeline);

      const result = await svc.whichOnline(['user-a', 'user-b', 'user-c']);
      expect(result).toEqual(['user-a', 'user-c']);
    });

    it('empty input → returns [] without Redis call', async () => {
      const result = await svc.whichOnline([]);
      expect(result).toEqual([]);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Graceful degradation — Redis unavailable
  // ──────────────────────────────────────────────────────────────────────────

  describe('graceful degradation', () => {
    it('onConnect — Redis throws → returns { isOnline: false, transition: false } without throwing', async () => {
      redis.sadd.mockRejectedValueOnce(new Error('ECONNREFUSED'));
      await expect(svc.onConnect('user-a', 'socket-1')).resolves.toEqual({
        isOnline: false,
        transition: false,
      });
    });

    it('onDisconnect — Redis throws → returns { isOnline: false, transition: false } without throwing', async () => {
      redis.srem.mockRejectedValueOnce(new Error('ECONNREFUSED'));
      await expect(svc.onDisconnect('user-a', 'socket-1')).resolves.toEqual({
        isOnline: false,
        transition: false,
      });
    });

    it('isOnline — Redis throws → returns false without throwing', async () => {
      redis.scard.mockRejectedValueOnce(new Error('ECONNREFUSED'));
      await expect(svc.isOnline('user-a')).resolves.toBe(false);
    });

    it('whichOnline — Redis pipeline throws → returns [] without throwing', async () => {
      const failPipeline = {
        scard: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValueOnce(new Error('ECONNREFUSED')),
      };
      (redis as unknown as { pipeline: jest.Mock }).pipeline = jest
        .fn()
        .mockReturnValue(failPipeline);
      await expect(svc.whichOnline(['user-a', 'user-b'])).resolves.toEqual([]);
    });
  });
});

describe('PresenceService — null Redis client (no REDIS_URL)', () => {
  it('instantiates with null client and all methods degrade gracefully', async () => {
    const svc = new PresenceService(null);

    await expect(svc.onConnect('u', 's')).resolves.toEqual({ isOnline: false, transition: false });
    await expect(svc.onDisconnect('u', 's')).resolves.toEqual({
      isOnline: false,
      transition: false,
    });
    await expect(svc.isOnline('u')).resolves.toBe(false);
    await expect(svc.whichOnline(['u'])).resolves.toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// TTL-based self-healing presence (Finding 2)
// ---------------------------------------------------------------------------

describe('PresenceService — TTL-based self-healing', () => {
  let redis: MockRedisClient;
  let svc: PresenceService;

  beforeEach(() => {
    redis = makeMockRedis();
    svc = new PresenceService(redis as unknown as import('ioredis').Redis);
    jest.clearAllMocks();
  });

  it('onConnect sets TTL on the conn key after SADD', async () => {
    redis.sadd.mockResolvedValueOnce(1).mockResolvedValueOnce(1);
    redis.expire.mockResolvedValue(1);

    await svc.onConnect('user-a', 'socket-1');

    // EXPIRE should be called on the conn key with a positive TTL
    expect(redis.expire).toHaveBeenCalledWith('presence:conn:user-a', expect.any(Number));
    const ttlArg = (redis.expire.mock.calls[0] as [string, number])[1];
    expect(ttlArg).toBeGreaterThan(0);
  });

  it('touch() refreshes TTL on the conn key for a live session', async () => {
    redis.scard.mockResolvedValue(1); // socket still in set
    redis.expire.mockResolvedValue(1);

    await svc.touch('user-a', 'socket-1');

    expect(redis.expire).toHaveBeenCalledWith('presence:conn:user-a', expect.any(Number));
  });

  it('isOnline returns false for a user whose conn key has lapsed (SCARD=0)', async () => {
    // smismember on presence:online returns 1 (stale online entry)
    // but SCARD on conn key returns 0 (key lapsed after pod crash)
    redis.scard.mockResolvedValueOnce(0);

    const online = await svc.isOnline('user-a');

    expect(online).toBe(false);
    // isOnline must consult the conn key (SCARD), not just the online set
    expect(redis.scard).toHaveBeenCalledWith('presence:conn:user-a');
  });

  it('touch() is a no-op when Redis is unavailable — does not throw', async () => {
    const nullSvc = new PresenceService(null);
    await expect(nullSvc.touch('user-a', 'socket-1')).resolves.toBeUndefined();
  });
});
