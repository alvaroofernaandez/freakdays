import { BadRequestException } from '@nestjs/common';

import { IdentityContextService } from '../common/identity/identity-context.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { WorkoutsService } from './workouts.service';

const mockIdentity = {
  getActiveUserByClerkIdOrThrow: jest.fn().mockResolvedValue({ id: 'u1', clerkUserId: 'c1' }),
  getActiveOrganizationByContextOrThrow: jest
    .fn()
    .mockResolvedValue({ id: 'o1', clerkOrgId: null }),
  assertMembershipOrThrow: jest.fn(),
} as unknown as IdentityContextService;

const makeWorkout = (overrides: Record<string, unknown> = {}) => ({
  id: 'w1',
  userId: 'u1',
  organizationId: 'o1',
  name: 'Leg Day',
  description: null,
  workoutDate: new Date('2026-05-01'),
  durationMinutes: 60,
  notes: null,
  status: 'completed' as const,
  startedAt: null,
  completedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  exercises: [],
  ...overrides,
});

describe('WorkoutsService', () => {
  let service: WorkoutsService;
  let mockPrisma: {
    workoutSession: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      deleteMany: jest.Mock;
      aggregate: jest.Mock;
    };
    workoutExercise: {
      findFirst: jest.Mock;
      aggregate: jest.Mock;
      create: jest.Mock;
    };
    workoutSet: {
      findFirst: jest.Mock;
      aggregate: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      deleteMany: jest.Mock;
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockPrisma = {
      workoutSession: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        deleteMany: jest.fn(),
        aggregate: jest.fn(),
      },
      workoutExercise: {
        findFirst: jest.fn().mockResolvedValue(null),
        aggregate: jest.fn().mockResolvedValue({ _max: { orderIndex: null } }),
        create: jest.fn(),
      },
      workoutSet: {
        findFirst: jest.fn().mockResolvedValue(null),
        aggregate: jest.fn().mockResolvedValue({ _max: { setNumber: null } }),
        create: jest.fn(),
        update: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    service = new WorkoutsService(mockPrisma as unknown as PrismaService, mockIdentity);
  });

  describe('getWeeklyStats', () => {
    it('returns correct count and totalMinutes from aggregate', async () => {
      mockPrisma.workoutSession.aggregate.mockResolvedValue({
        _sum: { durationMinutes: 120 },
        _count: { _all: 3 },
      });

      const result = await service.getWeeklyStats('c1', 'o1');

      expect(mockPrisma.workoutSession.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          _sum: { durationMinutes: true },
          _count: { _all: true },
        }),
      );
      expect(result.count).toBe(3);
      expect(result.totalMinutes).toBe(120);
    });

    it('returns 0 totalMinutes when _sum.durationMinutes is null', async () => {
      mockPrisma.workoutSession.aggregate.mockResolvedValue({
        _sum: { durationMinutes: null },
        _count: { _all: 0 },
      });

      const result = await service.getWeeklyStats('c1', 'o1');

      expect(result.totalMinutes).toBe(0);
      expect(result.count).toBe(0);
    });
  });

  describe('list', () => {
    it('queries by userId and organizationId', async () => {
      const workouts = [makeWorkout(), makeWorkout({ id: 'w2', name: 'Upper Body' })];
      mockPrisma.workoutSession.findMany.mockResolvedValue(workouts);

      const result = await service.list('c1', 'o1');

      expect(mockPrisma.workoutSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'u1', organizationId: 'o1' },
          orderBy: { workoutDate: 'desc' },
        }),
      );
      expect(result).toHaveLength(2);
    });
  });

  describe('getInProgress', () => {
    it('returns null when no in_progress session exists', async () => {
      mockPrisma.workoutSession.findFirst.mockResolvedValue(null);

      const result = await service.getInProgress('c1', 'o1');

      expect(result).toBeNull();
      expect(mockPrisma.workoutSession.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'in_progress' }),
        }),
      );
    });

    it('returns mapped session when an in_progress session exists', async () => {
      const workout = makeWorkout({ status: 'in_progress', startedAt: new Date() });
      mockPrisma.workoutSession.findFirst.mockResolvedValue(workout);

      const result = await service.getInProgress('c1', 'o1');

      expect(result).not.toBeNull();
      expect(result?.in_progress).toBe(true);
    });
  });

  describe('create', () => {
    it('throws BadRequestException when name is empty', async () => {
      await expect(service.create('c1', 'o1', { name: '' })).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when name is only whitespace', async () => {
      await expect(service.create('c1', 'o1', { name: '   ' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('creates workout with default status in_progress', async () => {
      const created = makeWorkout({ status: 'in_progress', startedAt: new Date() });
      mockPrisma.workoutSession.create.mockResolvedValue(created);

      const result = await service.create('c1', 'o1', { name: 'Morning Run' });

      expect(mockPrisma.workoutSession.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Morning Run',
            status: 'in_progress',
          }),
        }),
      );
      expect(result.in_progress).toBe(true);
    });
  });
});
