import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

import { CommonModule } from '../common/common.module';
import { EventBusService } from './event-bus.service';
import { OutboxRelayService } from './outbox-relay.service';
import { DomainEventsProcessor } from './domain-events.processor';
import { QuestCompletedHandler } from './handlers/quest-completed.handler';
import { parseRedisUrl } from './redis.util';

@Module({
  imports: [
    CommonModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = config.get<string>('REDIS_URL');
        const conn = parseRedisUrl(redisUrl);

        if (!conn) {
          // No Redis configured (test/dev without Redis).
          // BullMQ requires a connection object — we provide a localhost placeholder
          // with lazyConnect semantics so the module boots without a live Redis.
          // Workers/relay won't actually publish, but the DI graph is valid.
          return {
            connection: {
              host: 'localhost',
              port: 6379,
              lazyConnect: true,
              enableOfflineQueue: false,
              connectTimeout: 100,
            },
          };
        }

        return { connection: conn };
      },
    }),
    BullModule.registerQueue({ name: 'domain-events' }),
  ],
  providers: [EventBusService, OutboxRelayService, DomainEventsProcessor, QuestCompletedHandler],
  exports: [EventBusService],
})
export class EventsModule {}
