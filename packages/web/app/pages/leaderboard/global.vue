<script setup lang="ts">
import ArcadeScoreboard from '@/components/party/ArcadeScoreboard.vue';
import { useLeaderboardStore } from '~~/stores/useLeaderboard';
import { computed, onMounted } from 'vue';

defineOptions({ name: 'LeaderboardGlobalPage' });

const leaderboardStore = useLeaderboardStore();

const LIMIT = 50;
const totalPages = computed(() => Math.max(1, Math.ceil(leaderboardStore.total / LIMIT)));

onMounted(async () => {
  await leaderboardStore.fetchGlobal(1, LIMIT).catch(() => {
    /* best-effort */
  });
});
</script>

<template>
  <div class="space-y-6" role="main">
    <header>
      <p
        class="flex items-center gap-1 font-pixel text-[8px] text-secondary/80 uppercase tracking-wider mb-0.5"
      >
        <span class="text-secondary">▸</span> CLASIFICACIÓN GLOBAL
      </p>
      <h1 class="text-2xl font-bold">Leaderboard Global</h1>
      <p class="text-sm text-muted-foreground mt-1">
        Solo aparecen los jugadores que eligieron participar en el leaderboard global.
      </p>
    </header>

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
