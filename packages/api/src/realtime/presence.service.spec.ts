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
    it('last socket disconnects → Lua eval returns [0, 1]; transition=true', async () => {
      // Lua returns [remaining=0, online_removed=1]
      redis.eval.mockResolvedValueOnce([0, 1]);

      const result = await svc.onDisconnect('user-a', 'socket-1');

      // Atomic eval called with correct keys/args
      expect(redis.eval).toHaveBeenCalledWith(
        expect.any(String), // Lua script
        2, // numkeys
        'presence:conn:user-a',
        'presence:online',
        'socket-1',
        'user-a',
      );
      // separate srem/scard must NOT be called
      expect(redis.srem).not.toHaveBeenCalled();
      expect(redis.scard).not.toHaveBeenCalled();
      expect(result).toEqual({ isOnline: false, transition: true });
    });

    it('first of two sockets disconnects → Lua eval returns [1, 0]; transition=false', async () => {
      // remaining=1 → not the last socket
      redis.eval.mockResolvedValueOnce([1, 0]);

      const result = await svc.onDisconnect('user-a', 'socket-1');

      expect(result).toEqual({ isOnline: true, transition: false });
    });

    it('unknown socketId (crashed pod) → Lua eval returns [0, 1]; still marks offline; transition=true', async () => {
      // The socket was not in the set but SCARD=0 → user is offline
      redis.eval.mockResolvedValueOnce([0, 1]);

      const result = await svc.onDisconnect('user-a', 'socket-ghost');

      expect(result).toEqual({ isOnline: false, transition: true });
    });

    it('concurrent disconnects: second call gets [0, 0] → isOnline=false, transition=false (already offline)', async () => {
      // Lua guarantees only ONE call does the SREM on online (online_removed=0 for the second)
      redis.eval.mockResolvedValueOnce([0, 0]);

      const result = await svc.onDisconnect('user-a', 'socket-2');

      expect(result).toEqual({ isOnline: false, transition: false });
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

    it('onDisconnect — Redis eval throws → returns { isOnline: false, transition: false } without throwing', async () => {
      redis.eval.mockRejectedValueOnce(new Error('ECONNREFUSED'));
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
// Atomic disconnect — Lua script (Finding 3)
// ---------------------------------------------------------------------------

describe('PresenceService — atomic disconnect (Lua eval)', () => {
  let redis: MockRedisClient;
  let svc: PresenceService;

  beforeEach(() => {
    redis = makeMockRedis();
    svc = new PresenceService(redis as unknown as import('ioredis').Redis);
    jest.clearAllMocks();
  });

  it('onDisconnect uses eval (Lua) for the SREM+SCARD step — not separate srem+scard calls', async () => {
    // The Lua script returns [remaining_conn_count, online_removed] pair.
    // Here: 0 remaining → offline transition expected.
    redis.eval.mockResolvedValueOnce([0, 1]);

    const result = await svc.onDisconnect('user-a', 'socket-1');

    // eval must be called (atomic), plain srem/scard must NOT be called separately
    expect(redis.eval).toHaveBeenCalled();
    expect(redis.srem).not.toHaveBeenCalled();
    expect(redis.scard).not.toHaveBeenCalled();
    expect(result).toEqual({ isOnline: false, transition: true });
  });

  it('concurrent disconnects: two calls both calling eval each get their own result — offline fires exactly once per call returning remaining=0', async () => {
    // First call: remaining=0 (offline)
    // Second call: remaining=0 too (e.g. race — both think last socket)
    // With Lua, only ONE actually removes from online (returns online_removed=1 vs 0)
    redis.eval
      .mockResolvedValueOnce([0, 1]) // first disconnect: was last, removed from online
      .mockResolvedValueOnce([0, 0]); // second disconnect: remaining=0 but already removed from online

    const [r1, r2] = await Promise.all([
      svc.onDisconnect('user-a', 'socket-1'),
      svc.onDisconnect('user-a', 'socket-2'),
    ]);

    // Only the call where online_removed=1 triggers transition=true
    expect(r1).toEqual({ isOnline: false, transition: true });
    expect(r2).toEqual({ isOnline: false, transition: false });
  });

  it('eval — Redis throws → graceful degradation (offline, no throw)', async () => {
    redis.eval.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    await expect(svc.onDisconnect('user-a', 'socket-1')).resolves.toEqual({
      isOnline: false,
      transition: false,
    });
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
