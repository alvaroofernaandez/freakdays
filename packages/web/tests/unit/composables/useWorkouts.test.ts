import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useWorkouts } from '../../../app/composables/useWorkouts';
import { useAuthStore } from '../../../stores/auth';

const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  del: vi.fn(),
};

const mockAuthRefresh = vi.fn().mockResolvedValue(undefined);

vi.mock('../../../app/composables/useApiClient', () => ({
  useApiClient: () => mockApi,
}));

vi.mock('../../../app/composables/useAuthContext', () => ({
  useAuthContext: () => ({
    refresh: mockAuthRefresh,
  }),
}));

describe('useWorkouts', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('fetchWorkouts', () => {
    it('retorna [] cuando no hay sesión', async () => {
      const authStore = useAuthStore();
      authStore.setSession(null);

      const workoutsApi = useWorkouts();
      const workouts = await workoutsApi.fetchWorkouts();

      expect(workouts).toEqual([]);
      expect(mockApi.get).not.toHaveBeenCalled();
    });

    it('consume GET /v1/workouts con requireOrg y mapea resultados', async () => {
      const authStore = useAuthStore();
      authStore.setSession({ user: { id: 'user-1' } } as never);

      mockApi.get.mockResolvedValue([
        {
          id: '1',
          name: 'Test Workout',
          description: null,
          workout_date: new Date('2026-03-01').toISOString(),
          duration_minutes: 60,
          notes: null,
          status: 'completed',
          started_at: null,
          completed_at: null,
          workout_exercises: [],
        },
      ]);

      const workoutsApi = useWorkouts();
      const workouts = await workoutsApi.fetchWorkouts();

      expect(mockApi.get).toHaveBeenCalledWith('/v1/workouts', {
        requireOrg: true,
        query: { limit: 20 },
      });
      expect(workouts).toHaveLength(1);
      expect(workouts[0]?.name).toBe('Test Workout');
    });
  });

  describe('createWorkout', () => {
    it('retorna null cuando no hay sesión', async () => {
      const authStore = useAuthStore();
      authStore.setSession(null);

      const workoutsApi = useWorkouts();
      const result = await workoutsApi.createWorkout({
        name: 'Test',
        workout_date: new Date().toISOString(),
      });

      expect(result).toBeNull();
      expect(mockApi.post).not.toHaveBeenCalled();
    });

    it('crea workout con POST /v1/workouts', async () => {
      const authStore = useAuthStore();
      authStore.setSession({ user: { id: 'user-1' } } as never);

      mockApi.post.mockResolvedValue({
        id: '1',
        name: 'Test Workout',
        workout_date: new Date('2026-03-01').toISOString(),
        status: 'in_progress',
        description: null,
        duration_minutes: null,
        notes: null,
        started_at: new Date('2026-03-01T10:00:00.000Z').toISOString(),
        completed_at: null,
        workout_exercises: [],
      });

      const workoutsApi = useWorkouts();
      const result = await workoutsApi.createWorkout({
        name: 'Test Workout',
        workout_date: '2026-03-01',
      });

      expect(result?.name).toBe('Test Workout');
      expect(mockApi.post).toHaveBeenCalledWith(
        '/v1/workouts',
        expect.objectContaining({
          name: 'Test Workout',
          workout_date: '2026-03-01',
          status: 'in_progress',
        }),
        { requireOrg: true },
      );
    });
  });

  describe('getInProgressWorkout', () => {
    it('retorna null cuando no hay sesión', async () => {
      const authStore = useAuthStore();
      authStore.setSession(null);

      const workoutsApi = useWorkouts();
      const result = await workoutsApi.getInProgressWorkout();

      expect(result).toBeNull();
      expect(mockApi.get).not.toHaveBeenCalledWith('/v1/workouts/in-progress', expect.anything());
    });

    it('consulta GET /v1/workouts/in-progress', async () => {
      const authStore = useAuthStore();
      authStore.setSession({ user: { id: 'user-1' } } as never);

      mockApi.get.mockResolvedValue({
        id: '1',
        name: 'In Progress Workout',
        status: 'in_progress',
        workout_date: new Date('2026-03-01').toISOString(),
        workout_exercises: [],
      });

      const workoutsApi = useWorkouts();
      const result = await workoutsApi.getInProgressWorkout();

      expect(result?.name).toBe('In Progress Workout');
      expect(mockApi.get).toHaveBeenCalledWith('/v1/workouts/in-progress', {
        requireOrg: true,
      });
    });
  });
});
