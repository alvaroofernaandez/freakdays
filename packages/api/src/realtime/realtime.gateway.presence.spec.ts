/**
 * Integration tests for RealtimeGateway — presence hooks (PR2).
 *
 * Tests that handleConnection calls PresenceService.onConnect and emits
 * PRESENCE_CHANGED to friend rooms on an online transition, and that
 * handleDisconnect calls PresenceService.onDisconnect + emits on offline.
 *
 * PresenceService and FriendshipService are injected as mocks. No real Redis
 * or Socket.IO server is needed.
 */

// Mock jose/clerk ESM chain
jest.mock('../auth/strategies/clerk-jwt.strategy', () => ({
  ClerkJwtStrategy: jest.fn(),
}));

import { RealtimeGateway } from './realtime.gateway';
import type { PresenceService } from './presence.service';
import type { FriendshipService } from '../social/friendship.service';

// ─── Helpers ────────────────────────────────────────────────────────────────

const makeSocket = (token?: string, socketId = 'socket-1') => ({
  handshake: {
    auth: token !== undefined ? { token } : {},
    headers: {},
  },
  data: {} as Record<string, unknown>,
  join: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn(),
  id: socketId,
  rooms: new Set<string>(),
});

const makeStrategy = (sub: string, orgId?: string) => ({
  validateToken: jest.fn().mockResolvedValue({ sub, org_id: orgId }),
});

const makePrisma = (parties: Array<{ partyId: string }> = []) => ({
  partyMember: {
    findMany: jest.fn().mockResolvedValue(parties),
  },
});

const makePresence = (
  connectResult = { isOnline: true, transition: true },
  disconnectResult = { isOnline: false, transition: true },
): jest.Mocked<Pick<PresenceService, 'onConnect' | 'onDisconnect'>> => ({
  onConnect: jest.fn().mockResolvedValue(connectResult),
  onDisconnect: jest.fn().mockResolvedValue(disconnectResult),
});

const makeFriendship = (
  friendIds: string[] = ['friend-1', 'friend-2'],
): jest.Mocked<Pick<FriendshipService, 'listFriends'>> => ({
  listFriends: jest.fn().mockResolvedValue(friendIds),
});

const mockServer = {
  to: jest.fn().mockReturnThis(),
  emit: jest.fn(),
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('RealtimeGateway — presence hooks', () => {
  let gateway: RealtimeGateway;
  let strategy: ReturnType<typeof makeStrategy>;
  let prisma: ReturnType<typeof makePrisma>;
  let presence: ReturnType<typeof makePresence>;
  let friendship: ReturnType<typeof makeFriendship>;

  beforeEach(() => {
    strategy = makeStrategy('user-abc');
    prisma = makePrisma();
    presence = makePresence();
    friendship = makeFriendship(['friend-1', 'friend-2']);

    gateway = new RealtimeGateway(
      strategy as unknown as import('../auth/strategies/clerk-jwt.strategy').ClerkJwtStrategy,
      prisma as unknown as import('../common/prisma/prisma.service').PrismaService,
      presence as unknown as PresenceService,
      friendship as unknown as FriendshipService,
    );

    (gateway as unknown as { server: typeof mockServer }).server = mockServer;
    jest.clearAllMocks();
    mockServer.to.mockReturnThis();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // handleConnection
  // ──────────────────────────────────────────────────────────────────────────

  describe('handleConnection', () => {
    it('calls presence.onConnect with userId and socketId after auth', async () => {
      const socket = makeSocket('valid.token', 'socket-1');
      strategy.validateToken.mockResolvedValue({ sub: 'user-abc' });
      (gateway as unknown as { strategy: typeof strategy }).strategy = strategy;
      (gateway as unknown as { prisma: typeof prisma }).prisma = makePrisma();
      (gateway as unknown as { presenceService: typeof presence }).presenceService = presence;
      (gateway as unknown as { friendshipService: typeof friendship }).friendshipService =
        friendship;

      await gateway.handleConnection(
        socket as unknown as Parameters<typeof gateway.handleConnection>[0],
      );

      expect(presence.onConnect).toHaveBeenCalledWith('user-abc', 'socket-1');
    });

    it('first socket (transition=true) → emits PRESENCE_CHANGED online to each friend room', async () => {
      const socket = makeSocket('valid.token', 'socket-1');
      strategy.validateToken.mockResolvedValue({ sub: 'user-abc' });
      presence.onConnect.mockResolvedValue({ isOnline: true, transition: true });
      friendship.listFriends.mockResolvedValue(['friend-1', 'friend-2']);
      (gateway as unknown as { strategy: typeof strategy }).strategy = strategy;
      (gateway as unknown as { prisma: typeof prisma }).prisma = makePrisma();
      (gateway as unknown as { presenceService: typeof presence }).presenceService = presence;
      (gateway as unknown as { friendshipService: typeof friendship }).friendshipService =
        friendship;
      (gateway as unknown as { server: typeof mockServer }).server = mockServer;

      await gateway.handleConnection(
        socket as unknown as Parameters<typeof gateway.handleConnection>[0],
      );

      expect(friendship.listFriends).toHaveBeenCalledWith('user-abc');
      expect(mockServer.to).toHaveBeenCalledWith('user:friend-1');
      expect(mockServer.to).toHaveBeenCalledWith('user:friend-2');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'presence_changed',
        expect.objectContaining({ userId: 'user-abc', online: true }),
      );
    });

    it('non-transition connect (second socket) → does NOT emit PRESENCE_CHANGED', async () => {
      const socket = makeSocket('valid.token', 'socket-2');
      strategy.validateToken.mockResolvedValue({ sub: 'user-abc' });
      presence.onConnect.mockResolvedValue({ isOnline: true, transition: false });
      (gateway as unknown as { strategy: typeof strategy }).strategy = strategy;
      (gateway as unknown as { prisma: typeof prisma }).prisma = makePrisma();
      (gateway as unknown as { presenceService: typeof presence }).presenceService = presence;
      (gateway as unknown as { friendshipService: typeof friendship }).friendshipService =
        friendship;
      (gateway as unknown as { server: typeof mockServer }).server = mockServer;

      await gateway.handleConnection(
        socket as unknown as Parameters<typeof gateway.handleConnection>[0],
      );

      // emit should never be called for PRESENCE_CHANGED
      const emitCalls = (mockServer.emit as jest.Mock).mock.calls as unknown[][];
      const presenceCalls = emitCalls.filter((args) => args[0] === 'presence_changed');
      expect(presenceCalls).toHaveLength(0);
    });

    it('presence.onConnect failure → does not break handleConnection flow', async () => {
      const socket = makeSocket('valid.token', 'socket-1');
      strategy.validateToken.mockResolvedValue({ sub: 'user-abc' });
      presence.onConnect.mockResolvedValue({ isOnline: false, transition: false });
      (gateway as unknown as { strategy: typeof strategy }).strategy = strategy;
      (gateway as unknown as { prisma: typeof prisma }).prisma = makePrisma();
      (gateway as unknown as { presenceService: typeof presence }).presenceService = presence;
      (gateway as unknown as { friendshipService: typeof friendship }).friendshipService =
        friendship;

      // Should not throw
      await expect(
        gateway.handleConnection(
          socket as unknown as Parameters<typeof gateway.handleConnection>[0],
        ),
      ).resolves.toBeUndefined();
      expect(socket.disconnect).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // handleDisconnect
  // ──────────────────────────────────────────────────────────────────────────

  describe('handleDisconnect', () => {
    it('calls presence.onDisconnect with userId and socketId', async () => {
      const socket = makeSocket('valid.token', 'socket-1');
      socket.data['userId'] = 'user-abc';
      (gateway as unknown as { presenceService: typeof presence }).presenceService = presence;
      (gateway as unknown as { friendshipService: typeof friendship }).friendshipService =
        friendship;
      (gateway as unknown as { server: typeof mockServer }).server = mockServer;
      presence.onDisconnect.mockResolvedValue({ isOnline: false, transition: true });
      friendship.listFriends.mockResolvedValue(['friend-1']);

      await gateway.handleDisconnect(
        socket as unknown as Parameters<typeof gateway.handleDisconnect>[0],
      );

      expect(presence.onDisconnect).toHaveBeenCalledWith('user-abc', 'socket-1');
    });

    it('last disconnect (transition=true) → emits PRESENCE_CHANGED offline to friend rooms', async () => {
      const socket = makeSocket('valid.token', 'socket-1');
      socket.data['userId'] = 'user-abc';
      presence.onDisconnect.mockResolvedValue({ isOnline: false, transition: true });
      friendship.listFriends.mockResolvedValue(['friend-1', 'friend-2']);
      (gateway as unknown as { presenceService: typeof presence }).presenceService = presence;
      (gateway as unknown as { friendshipService: typeof friendship }).friendshipService =
        friendship;
      (gateway as unknown as { server: typeof mockServer }).server = mockServer;

      await gateway.handleDisconnect(
        socket as unknown as Parameters<typeof gateway.handleDisconnect>[0],
      );

      expect(friendship.listFriends).toHaveBeenCalledWith('user-abc');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'presence_changed',
        expect.objectContaining({ userId: 'user-abc', online: false }),
      );
    });

    it('non-last disconnect (transition=false) → does NOT emit PRESENCE_CHANGED', async () => {
      const socket = makeSocket('valid.token', 'socket-1');
      socket.data['userId'] = 'user-abc';
      presence.onDisconnect.mockResolvedValue({ isOnline: true, transition: false });
      (gateway as unknown as { presenceService: typeof presence }).presenceService = presence;
      (gateway as unknown as { friendshipService: typeof friendship }).friendshipService =
        friendship;
      (gateway as unknown as { server: typeof mockServer }).server = mockServer;

      await gateway.handleDisconnect(
        socket as unknown as Parameters<typeof gateway.handleDisconnect>[0],
      );

      const emitCalls = (mockServer.emit as jest.Mock).mock.calls as unknown[][];
      const presenceCalls = emitCalls.filter((args) => args[0] === 'presence_changed');
      expect(presenceCalls).toHaveLength(0);
    });

    it('disconnect without userId in socket.data → no presence call', async () => {
      const socket = makeSocket('valid.token', 'socket-1');
      // socket.data is empty — unauthenticated socket disconnecting
      (gateway as unknown as { presenceService: typeof presence }).presenceService = presence;

      await gateway.handleDisconnect(
        socket as unknown as Parameters<typeof gateway.handleDisconnect>[0],
      );

      expect(presence.onDisconnect).not.toHaveBeenCalled();
    });
  });
});
