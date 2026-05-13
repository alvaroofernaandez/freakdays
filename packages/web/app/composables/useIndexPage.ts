import type { UserProfile } from '@/composables/useProfile';
import { getGreeting } from '@/utils/greeting';
import { useModulesStore } from '~~/stores/modules';
import { useAuthStore } from '~~/stores/auth';

export function useIndexPage() {
  const modulesStore = useModulesStore();
  const profileApi = useProfile();
  const userModulesApi = useUserModules();
  const authStore = useAuthStore();
  const questsApi = useQuests();
  const animeApi = useAnime();
  const workoutsApi = useWorkouts();

  const profile = ref<UserProfile | null>(null);
  const profilePending = ref(true);
  const modulesPending = ref(false);

  onMounted(async () => {
    if (import.meta.client) {
      profilePending.value = true;
      try {
        profile.value = await profileApi.fetchProfile();
      } finally {
        profilePending.value = false;
      }

      if (authStore.isAuthenticated && authStore.userId && !modulesStore.synced) {
        modulesPending.value = true;
        try {
          const modules = await userModulesApi.fetchUserModules();

          if (modules.length > 0) {
            modulesStore.setModulesFromDb(modules);
          } else {
            modulesStore.synced = true;
          }
        } finally {
          modulesPending.value = false;
        }
      }
    }
  });

  const isLoading = computed(() => profilePending.value || modulesPending.value);
  const greeting = computed(() => getGreeting());

  const expProgress = computed(() => {
    if (!profile.value) return { current: 0, needed: 100, progress: 0 };
    return profileApi.expForNextLevel(profile.value.totalExp);
  });

  const quickStats = ref({
    questsToday: 0,
    questsPending: 0,
    animeWatching: 0,
    workoutsThisWeek: 0,
  });

  const loadingStats = ref(false);

  async function loadQuickStats() {
    if (!authStore.isAuthenticated) return;

    loadingStats.value = true;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [quests, completions, anime, workouts] = await Promise.all([
        questsApi.fetchQuests().catch(() => []),
        questsApi.fetchTodayCompletions().catch(() => []),
        animeApi.fetchAnimeList().catch(() => []),
        workoutsApi.fetchWorkouts().catch(() => []),
      ]);

      const questsToday = completions.length;
      const completionSet = new Set(completions);
      const questsPending = quests.filter((q) => !completionSet.has(q.id)).length;

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      quickStats.value = {
        questsToday: questsToday,
        questsPending: questsPending,
        animeWatching: anime.filter((a) => a.status === 'watching').length,
        workoutsThisWeek: workouts.filter((w) => {
          if (!w.workoutDate) return false;
          const workoutDate = new Date(w.workoutDate);
          return workoutDate >= weekAgo && w.status === 'completed';
        }).length,
      };
    } catch (error) {
      console.error('Error loading quick stats:', error);
    } finally {
      loadingStats.value = false;
    }
  }

  watch(
    () => authStore.isAuthenticated,
    async (isAuth) => {
      if (isAuth) {
        await loadQuickStats();
      }
    },
  );

  onMounted(async () => {
    if (authStore.isAuthenticated) {
      await loadQuickStats();
    }
  });

  return {
    profile: computed(() => profile.value),
    isLoading,
    greeting,
    expProgress,
    quickStats: readonly(quickStats),
    loadingStats: readonly(loadingStats),
    modulesStore,
  };
}
