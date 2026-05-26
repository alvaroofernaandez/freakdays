<script setup lang="ts">
import ArcadeScoreboard from '@/components/party/ArcadeScoreboard.vue';
import { useApiClient } from '@/composables/useApiClient';
import { useAuthStore } from '~~/stores/auth';
import { useLeaderboardStore } from '~~/stores/useLeaderboard';
import { Trophy } from 'lucide-vue-next';
import { computed, onMounted, ref, watch } from 'vue';

defineOptions({ name: 'LeaderboardGlobalPage' });

useSeoMeta({
  title: 'Clasificación Global — FreakDays',
  description: 'Ranking global de jugadores que eligieron participar.',
});

const leaderboardStore = useLeaderboardStore();
const authStore = useAuthStore();
const { get, patch } = useApiClient();

const LIMIT = 50;
const totalPages = computed(() => Math.max(1, Math.ceil(leaderboardStore.total / LIMIT)));

// ── Leaderboard opt-in state ──────────────────────────────────────────────────

interface ProfileOptInResponse {
  leaderboardOptIn?: boolean;
}

const leaderboardOptIn = ref<boolean | null>(null); // null = not loaded yet
const optInSaving = ref(false);

async function fetchOptInStatus(): Promise<void> {
  if (!authStore.isAuthenticated) {
    leaderboardOptIn.value = false;
    return;
  }
  try {
    const data = await get<ProfileOptInResponse>('/v1/profile/me');
    leaderboardOptIn.value = Boolean(data.leaderboardOptIn);
  } catch {
    leaderboardOptIn.value = false;
  }
}

async function handleJoinLeaderboard(): Promise<void> {
  if (optInSaving.value) return;
  optInSaving.value = true;
  try {
    await patch('/v1/profile/me', { leaderboardOptIn: true });
    leaderboardOptIn.value = true;
    await leaderboardStore.fetchGlobal(1, LIMIT);
  } catch {
    // best-effort: silently ignore; user can retry
  } finally {
    optInSaving.value = false;
  }
}

/** Show the CTA only when auth state is settled and user is not opted in. */
const showOptInCta = computed(() => authStore.isAuthenticated && leaderboardOptIn.value === false);

// Re-check opt-in when auth state changes (e.g., page loaded before auth ready)
watch(
  () => authStore.isAuthenticated,
  (isAuth) => {
    if (isAuth && leaderboardOptIn.value === null) {
      fetchOptInStatus();
    }
  },
);

onMounted(async () => {
  await Promise.all([
    leaderboardStore.fetchGlobal(1, LIMIT).catch(() => {
      /* best-effort */
    }),
    fetchOptInStatus(),
  ]);
});
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-6 space-y-6" role="main">
    <!-- ── Header ─────────────────────────────────────────────────── -->
    <header class="space-y-1">
      <p
        class="flex items-center gap-1.5 font-pixel text-[8px] text-secondary/80 uppercase tracking-wider"
      >
        <span class="text-secondary">▸</span> CLASIFICACIÓN GLOBAL
      </p>
      <h1 class="flex items-center gap-2 text-2xl font-bold">
        <Trophy class="h-6 w-6 text-exp-medium shrink-0" aria-hidden="true" />
        Leaderboard Global
      </h1>
      <p class="text-sm text-muted-foreground">
        Solo aparecen los jugadores que eligieron participar en el ranking global.
      </p>
    </header>

    <!-- ── Opt-in CTA ──────────────────────────────────────────────── -->
    <div
      v-if="showOptInCta"
      class="border-2 border-primary/40 bg-primary/5 px-5 py-5 space-y-3"
      style="box-shadow: 0 0 16px oklch(0.65 0.25 290 / 0.15)"
      role="complementary"
      aria-label="Unirse al ranking global"
    >
      <p class="font-pixel text-[8px] text-primary uppercase tracking-widest">
        ▸ TÚ NO APARECES AÚN
      </p>
      <p class="text-sm text-muted-foreground leading-relaxed">
        Tu perfil está oculto en el ranking global. Activa tu participación para que otros jugadores
        puedan ver tu posición.
      </p>
      <button
        type="button"
        :class="[
          'btn-game px-4 py-2.5 border-2 border-primary bg-primary/10 font-pixel text-[8px] text-primary uppercase tracking-widest',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'hover:bg-primary/20 hover:border-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
          'motion-safe:transition-colors duration-150',
        ]"
        :disabled="optInSaving"
        :aria-busy="optInSaving"
        aria-label="Unirse a la clasificación global"
        @click="handleJoinLeaderboard"
      >
        <span v-if="optInSaving" class="motion-safe:animate-pulse">GUARDANDO…</span>
        <span v-else>▶ ÚNETE A LA CLASIFICACIÓN GLOBAL</span>
      </button>
    </div>

    <!-- ── Scoreboard ─────────────────────────────────────────────── -->
    <ArcadeScoreboard
      :rows="leaderboardStore.globalRows"
      :your-rank="leaderboardStore.yourRank"
      :total="leaderboardStore.total"
      :page="leaderboardStore.page"
      :loading="leaderboardStore.loading"
      :total-pages="totalPages"
      @prev-page="leaderboardStore.prevPage('global')"
      @next-page="leaderboardStore.nextPage('global')"
    />
  </div>
</template>
