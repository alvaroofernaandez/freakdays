import { RealtimeGateway } from './realtime.gateway';

// Mock ClerkJwtStrategy to avoid pulling in jose (ESM) into jest
jest.mock('../auth/strategies/clerk-jwt.strategy', () => ({
  ClerkJwtStrategy: jest.fn(),
}));

const makeSocket = (token?: string, authHeader?: string) => ({
  handshake: {
    auth: token !== undefined ? { token } : {},
    headers: authHeader !== undefined ? { authorization: authHeader } : {},
  },
  data: {} as Record<string, unknown>,
  join: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn(),
  id: 'socket-test-id',
});

interface MockStrategy {
  validateToken: jest.Mock;
}

const makeStrategy = (resolvedPayload?: { sub: string; org_id?: string }): MockStrategy => ({
  validateToken: jest.fn().mockImplementation(async () => {
    if (!resolvedPayload) throw new Error('Invalid token');
    return resolvedPayload;
  }),
});

const mockServer = {
  to: jest.fn().mockReturnThis(),
  emit: jest.fn(),
};

// Mock PrismaService for party room membership
const makePrisma = (partyMemberships: Array<{ partyId: string }> = []) => ({
  partyMember: {
    findMany: jest.fn().mockResolvedValue(partyMemberships),
  },
});

describe('RealtimeGateway — handshake auth + room isolation', () => {
  let gateway: RealtimeGateway;
  let strategy: MockStrategy;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    strategy = makeStrategy({ sub: 'user-abc', org_id: undefined });
    prisma = makePrisma();

    gateway = new RealtimeGateway(strategy as any, prisma as any);
    // Assign mock server

    (gateway as any).server = mockServer;
    jest.clearAllMocks();
  });

  it('valid token → socket joins user:{sub}', async () => {
    const socket = makeSocket('valid.jwt.token');
    strategy.validateToken.mockResolvedValue({ sub: 'user-abc' });
    // Reassign strategy after clearAllMocks

    (gateway as any).strategy = strategy;
    (gateway as any).prisma = makePrisma();

    await gateway.handleConnection(socket as any);

    expect(socket.disconnect).not.toHaveBeenCalled();
    expect(socket.join).toHaveBeenCalledWith('user:user-abc');
    expect(socket.data['userId']).toBe('user-abc');
  });

  it('valid token with org_id → joins user:{sub} AND org:{orgId}', async () => {
    const socket = makeSocket('valid.jwt.token');
    strategy.validateToken.mockResolvedValue({ sub: 'user-abc', org_id: 'org-123' });

    (gateway as any).strategy = strategy;
    (gateway as any).prisma = makePrisma();

    await gateway.handleConnection(socket as any);

    expect(socket.join).toHaveBeenCalledWith('user:user-abc');
    expect(socket.join).toHaveBeenCalledWith('org:org-123');
    expect(socket.data['userId']).toBe('user-abc');
    expect(socket.data['orgId']).toBe('org-123');
  });

  it('invalid token → disconnect called, no room joined', async () => {
    const socket = makeSocket('bad.token');
    strategy.validateToken.mockRejectedValue(new Error('Invalid token'));

    (gateway as any).strategy = strategy;
    (gateway as any).prisma = makePrisma();

    await gateway.handleConnection(socket as any);

    expect(socket.disconnect).toHaveBeenCalledWith(true);
    expect(socket.join).not.toHaveBeenCalled();
  });

  it('missing token → disconnect called immediately, no room joined', async () => {
    const socket = makeSocket(undefined, undefined);

    (gateway as any).strategy = strategy;
    (gateway as any).prisma = makePrisma();

    await gateway.handleConnection(socket as any);

    expect(socket.disconnect).toHaveBeenCalledWith(true);
    expect(socket.join).not.toHaveBeenCalled();
    expect(strategy.validateToken).not.toHaveBeenCalled();
  });

  it('token in Authorization header (Bearer prefix) is accepted', async () => {
    const socket = makeSocket(undefined, 'Bearer header.jwt.token');
    strategy.validateToken.mockResolvedValue({ sub: 'user-xyz' });

    (gateway as any).strategy = strategy;
    (gateway as any).prisma = makePrisma();

    await gateway.handleConnection(socket as any);

    expect(strategy.validateToken).toHaveBeenCalledWith('header.jwt.token');
    expect(socket.join).toHaveBeenCalledWith('user:user-xyz');
  });

  it('room isolation: emitToUser for userA does NOT emit to userB room', () => {
    (gateway as any).server = mockServer;
    jest.clearAllMocks();
    // Reset the to mock to return the server for chaining
    mockServer.to.mockReturnThis();

    gateway.emitToUser('user-a', 'level_up', { newLevel: 3 });

    expect(mockServer.to).toHaveBeenCalledWith('user:user-a');
    const calls = (mockServer.to as jest.Mock).mock.calls as unknown[][];
    const callsToUserB = calls.filter((args) => args[0] === 'user:user-b');
    expect(callsToUserB).toHaveLength(0);
  });

  it('handleDisconnect does not throw', () => {
    const socket = makeSocket('valid.jwt.token');

    expect(() => gateway.handleDisconnect(socket as any)).not.toThrow();
  });

  // ─── S6 — Party room tests ──────────────────────────────────────────────────

  it('user in parties P1+P3 → socket joins party:P1 and party:P3, NOT party:P2', async () => {
    const socket = makeSocket('valid.jwt.token');
    strategy.validateToken.mockResolvedValue({ sub: 'user-u1' });

    (gateway as any).strategy = strategy;
    (gateway as any).prisma = makePrisma([{ partyId: 'P1' }, { partyId: 'P3' }]);

    await gateway.handleConnection(socket as any);

    expect(socket.join).toHaveBeenCalledWith('party:P1');
    expect(socket.join).toHaveBeenCalledWith('party:P3');
    const calls = (socket.join as jest.Mock).mock.calls as string[][];
    const partyP2Calls = calls.filter((args) => args[0] === 'party:P2');
    expect(partyP2Calls).toHaveLength(0);
  });

  it('emitToParty(P1, FEED_ENTRY_ADDED, payload) → server.to called with party:P1', () => {
    (gateway as any).server = mockServer;
    mockServer.to.mockReturnThis();
    jest.clearAllMocks();
    mockServer.to.mockReturnThis();

    gateway.emitToParty('P1', 'feed_entry_added', { id: 'fe-1' });

    expect(mockServer.to).toHaveBeenCalledWith('party:P1');
    expect(mockServer.emit).toHaveBeenCalledWith('feed_entry_added', { id: 'fe-1' });
  });
});
