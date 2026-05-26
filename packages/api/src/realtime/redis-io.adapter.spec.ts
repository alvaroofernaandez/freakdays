import type { INestApplicationContext } from '@nestjs/common';
import { RedisIoAdapter } from './redis-io.adapter';

const makeApp = (): INestApplicationContext =>
  ({
    get: jest.fn(),
    resolve: jest.fn(),
    select: jest.fn(),
    init: jest.fn(),
    close: jest.fn(),
    useLogger: jest.fn(),
    flushLogs: jest.fn(),
    enableShutdownHooks: jest.fn(),
    getHttpAdapter: jest.fn(),
    registerRequestByContextId: jest.fn(),
    getUrl: jest.fn(),
  }) as unknown as INestApplicationContext;

const mockServer = {
  adapter: jest.fn(),
};

// Mock the IoAdapter from @nestjs/platform-socket.io
jest.mock('@nestjs/platform-socket.io', () => ({
  IoAdapter: class MockIoAdapter {
    createIOServer(_port: number, _options?: unknown): any {
      return mockServer;
    }
  },
}));

// Mock ioredis
jest.mock('ioredis', () => {
  const MockRedis = jest.fn().mockImplementation(() => ({
    duplicate: jest.fn().mockReturnValue({
      on: jest.fn().mockReturnThis(),
    }),
    on: jest.fn().mockReturnThis(),
  }));
  return { default: MockRedis };
});

// Mock @socket.io/redis-adapter
jest.mock('@socket.io/redis-adapter', () => ({
  createAdapter: jest.fn().mockReturnValue('mocked-redis-adapter'),
}));

describe('RedisIoAdapter', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('REDIS_URL absent → createIOServer returns without calling server.adapter', () => {
    delete process.env['REDIS_URL'];

    const app = makeApp();
    const adapter = new RedisIoAdapter(app);

    const server = adapter.createIOServer(3000) as any;

    expect(server).toBe(mockServer);
    expect(mockServer.adapter).not.toHaveBeenCalled();
  });

  it('REDIS_URL present → server.adapter called with redis adapter instance', () => {
    process.env['REDIS_URL'] = 'redis://localhost:6379';

    const { createAdapter } = jest.requireMock('@socket.io/redis-adapter') as {
      createAdapter: jest.Mock;
    };

    const app = makeApp();
    const adapter = new RedisIoAdapter(app);

    adapter.createIOServer(3000) as any;

    expect(mockServer.adapter).toHaveBeenCalledWith('mocked-redis-adapter');
    expect(createAdapter).toHaveBeenCalled();
  });
});
