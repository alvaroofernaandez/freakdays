import { PrismaService } from '../../common/prisma/prisma.service';
import { EVENT_TYPES } from '../../events/event-types';
import type {
  DomainEvent,
  QuestCompletedPayload,
  AchievementUnlockedPayload,
} from '../../events/event.types';
import { StatsService } from './stats.service';
import { StatsProjectorHandler } from './stats-projector.handler';

const makeQuestEvent = (userId = 'u1', orgId = 'org-1'): DomainEvent<QuestCompletedPayload> => ({
  eventId: 'evt-1',
  type: EVENT_TYPES.QUEST_COMPLETED,
  aggregateId: 'quest-1',
  orgId,
  payload: { questId: 'quest-1', userId, expAwarded: 50, level: 1 },
  occurredAt: new Date(),
});

const makeAchievementEvent = (
  userId = 'u1',
  orgId = 'org-1',
): DomainEvent<AchievementUnlockedPayload> => ({
  eventId: 'evt-ach-1',
  type: EVENT_TYPES.ACHIEVEMENT_UNLOCKED,
  aggregateId: userId,
  orgId,
  payload: { userId, orgId, achievementCode: 'primer-paso', unlockedAt: new Date() },
  occurredAt: new Date(),
});

describe('StatsProjectorHandler', () => {
  let handler: StatsProjectorHandler;
  let mockStatsService: { rebuild: jest.Mock };
  let mockTx: Record<string, unknown>;

  beforeEach(() => {
    mockStatsService = {
      rebuild: jest.fn().mockResolvedValue(undefined),
    };

    mockTx = {};

    handler = new StatsProjectorHandler(
      undefined as unknown as PrismaService,
      mockStatsService as unknown as StatsService,
    );
  });

  it('calls rebuild when quest.completed is received', async () => {
    const event = makeQuestEvent();
    await handler.handle(event, mockTx as never);
    expect(mockStatsService.rebuild).toHaveBeenCalledWith('u1', 'org-1');
  });

  it('calls rebuild when achievement.unlocked is received', async () => {
    const event = makeAchievementEvent();
    await handler.handle(event, mockTx as never);
    expect(mockStatsService.rebuild).toHaveBeenCalledWith('u1', 'org-1');
  });

  it('does NOT call rebuild when userId is missing', async () => {
    const event: DomainEvent = {
      eventId: 'evt-bad',
      type: EVENT_TYPES.QUEST_COMPLETED,
      aggregateId: 'x',
      orgId: 'org-1',
      payload: {},
      occurredAt: new Date(),
    };
    await handler.handle(event, mockTx as never);
    expect(mockStatsService.rebuild).not.toHaveBeenCalled();
  });
});
