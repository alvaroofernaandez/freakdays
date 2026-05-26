import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import type { INestApplicationContext } from '@nestjs/common';
import type { Server, ServerOptions } from 'socket.io';
import Redis from 'ioredis';

import { parseRedisUrl } from '../events/redis.util';

export class RedisIoAdapter extends IoAdapter {
  constructor(app: INestApplicationContext) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, options) as Server;

    const conn = parseRedisUrl(process.env.REDIS_URL);

    if (conn) {
      try {
        const pubClient = new Redis(conn);
        const subClient = pubClient.duplicate();

        server.adapter(createAdapter(pubClient, subClient));
      } catch {
        // Silently fall back to in-memory adapter so the app boots even if
        // Redis is configured but unreachable at startup time.
      }
    }

    return server;
  }
}
