import { useAuthStore } from '~~/stores/auth';

export interface UserStats {
  id: string;
  userId: string;
  organizationId: string;
  questsPending: number;
  questsDoneToday: number;
  animesInProgress: number;
  workoutsThisWeek: number;
  totalExp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  achievementsCount: number;
  windowDate: string | null;
  updatedAt: string;
}

export interface QuickStats {
  questsToday: number;
  questsPending: number;
  animeWatching: number;
  workoutsThisWeek: number;
}

export function useStats() {
  const authStore = useAuthStore();
  const apiClient = useApiClient();
  const authContext = useAuthContext();

  async function fetchStats(): Promise<UserStats | null> {
    if (!authStore.userId) return null;

    try {
      await authContext.refresh();
    } catch {
      // best-effort
    }

    try {
      const data = await apiClient.get<UserStats>('/v1/stats/me');
      return data;
    } catch {
      return null;
    }
  }

  function toQuickStats(stats: UserStats | null): QuickStats {
    if (!stats) {
      return { questsToday: 0, questsPending: 0, animeWatching: 0, workoutsThisWeek: 0 };
    }
    return {
      questsToday: stats.questsDoneToday,
      questsPending: stats.questsPending,
      animeWatching: stats.animesInProgress,
      workoutsThisWeek: stats.workoutsThisWeek,
    };
  }

  return {
    fetchStats,
    toQuickStats,
  };
}
