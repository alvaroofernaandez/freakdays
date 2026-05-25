import type { EventType } from './event-types';

export interface DomainEvent<TPayload = unknown> {
  readonly eventId: string;
  readonly type: EventType;
  readonly aggregateId: string;
  readonly orgId: string | null;
  readonly payload: TPayload;
  readonly occurredAt: Date;
}

export interface QuestCompletedPayload {
  readonly questId: string;
  readonly userId: string;
  readonly expAwarded: number;
  readonly level: number;
}
