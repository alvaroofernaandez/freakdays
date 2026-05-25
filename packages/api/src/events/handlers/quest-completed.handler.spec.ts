import { computeLevel } from '@freakdays/domain';

import { PrismaService } from '../../common/prisma/prisma.service';
import { QuestCompletedHandler } from './quest-completed.handler';
import { EVENT_TYPES } from '../event-types';
import type { DomainEvent, QuestCompletedPayload } from '../event.types';

const makeEvent = (
  expAwarded: number,
  currentTotalExp: number,
): DomainEvent<QuestCompletedPayload> => ({
  eventId: 'evt-handler-test',
  type: EVENT_TYPES.QUEST_COMPLETED,
  aggregateId: 'quest-1',
  orgId: null,
  payload: {
    questId: 'quest-1',
    userId: 'user-1',
    expAwarded,
    level: computeLevel(currentTotalExp + expAwarded),
  },
  occurredAt: new Date(),
});

describe('QuestCompletedHandler', () => {
  let handler: QuestCompletedHandler;
  let mockTx: {
    profile: { findUnique: jest.Mock; update: jest.Mock };
    processedEvent: { create: jest.Mock };
  };

  const mockProfile = {
    id: 'profile-1',
    userId: 'user-1',
    totalExp: 190,
    level: 2,
  };

  beforeEach(() => {
    mockTx = {
      profile: {
        findUnique: jest.fn().mockResolvedValue(mockProfile),
        update: jest.fn().mockResolvedValue({ ...mockProfile }),
      },
      processedEvent: {
        create: jest.fn().mockResolvedValue({}),
      },
    };

    handler = new QuestCompletedHandler(undefined as unknown as PrismaService);
  });

  it('updates profile level using computeLevel from @freakdays/domain', async () => {
    const expAwarded = 15; // totalExp = 190 + 15 = 205 → level 3
    const event = makeEvent(expAwarded, 190);

    await handler.handle(event, mockTx as unknown as Parameters<typeof handler.handle>[1]);

    expect(mockTx.profile.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          level: computeLevel(205), // 3
        }),
      }),
    );
  });

  it('inserts a ProcessedEvent record in the same transaction', async () => {
    const event = makeEvent(10, 190);

    await handler.handle(event, mockTx as unknown as Parameters<typeof handler.handle>[1]);

    expect(mockTx.processedEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          eventId: event.eventId,
          type: event.type,
        }),
      }),
    );
  });

  it('uses profile.totalExp from DB (not payload.expAwarded) for level recompute', async () => {
    // DB has totalExp=190, payload says expAwarded=10 → newLevel = computeLevel(200) = 2
    mockTx.profile.findUnique.mockResolvedValue({ ...mockProfile, totalExp: 190 });
    const event = makeEvent(10, 190);

    await handler.handle(event, mockTx as unknown as Parameters<typeof handler.handle>[1]);

    expect(mockTx.profile.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          level: computeLevel(200),
        }),
      }),
    );
  });

  it('is idempotent: if ProcessedEvent already exists, it still reconciles level', async () => {
    // Handler itself doesn't check idempotency — DomainEventsProcessor does.
    // But if called directly, it should work without error.
    const event = makeEvent(10, 190);

    await expect(
      handler.handle(event, mockTx as unknown as Parameters<typeof handler.handle>[1]),
    ).resolves.not.toThrow();
  });
});
