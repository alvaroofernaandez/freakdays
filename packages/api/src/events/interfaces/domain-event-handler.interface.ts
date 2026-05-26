import type { Prisma } from '@prisma/client';

import type { EventType } from '../event-types';
import type { DomainEvent } from '../event.types';

export type DeferFn = (fn: () => void | Promise<void>) => void;

export interface DomainEventHandler {
  readonly name: string;
  readonly handles: readonly EventType[];
  handle(event: DomainEvent, tx: Prisma.TransactionClient, defer?: DeferFn): Promise<void>;
}
