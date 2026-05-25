import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

import type { EventType } from './event-types';
import type { DomainEvent } from './event.types';

@Injectable()
export class EventBusService {
  buildEvent<TPayload>(
    type: EventType,
    aggregateId: string,
    payload: TPayload,
    orgId?: string,
  ): DomainEvent<TPayload> {
    return {
      eventId: randomUUID(),
      type,
      aggregateId,
      orgId: orgId ?? null,
      payload,
      occurredAt: new Date(),
    };
  }

  async emit(tx: Prisma.TransactionClient, event: DomainEvent): Promise<void> {
    await tx.outboxEvent.create({
      data: {
        eventId: event.eventId,
        type: event.type,
        aggregateId: event.aggregateId,
        orgId: event.orgId ?? null,
        payload: event.payload as Prisma.InputJsonValue,
        occurredAt: event.occurredAt,
      },
    });
  }
}
