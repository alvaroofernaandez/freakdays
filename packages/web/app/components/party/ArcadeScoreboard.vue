<script setup lang="ts">
import type { LeaderboardRow } from '~~/stores/useLeaderboard';
import { computed } from 'vue';

interface Props {
  rows: readonly LeaderboardRow[];
  yourRank: number | null;
  total: number;
  page: number;
  loading?: boolean;
  /** Total pages, computed from total/limit outside */
  totalPages?: number;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  totalPages: 1,
});

const emit = defineEmits<{
  prevPage: [];
  nextPage: [];
}>();

const hasPrev = computed(() => props.page > 1);
const hasNext = computed(() => props.page < (props.totalPages ?? 1));

const isOffPage = computed(
  () => props.yourRank !== null && !props.rows.some((r) => r.isCurrentUser),
);
</script>

<template>
  <section aria-label="Leaderboard">
    <div v-if="loading && rows.length === 0" class="text-sm text-muted-foreground py-4 text-center">
      Cargando clasificación…
    </div>

    <div v-else-if="rows.length === 0" class="text-sm text-muted-foreground py-4 text-center">
      No hay participantes aún.
    </div>

    <template v-else>
      <!-- Off-page yourRank banner -->
      <div
        v-if="isOffPage && yourRank !== null"
        class="mb-3 px-3 py-2 text-sm bg-secondary/10 border border-secondary/30 rounded-md"
        role="status"
        aria-live="polite"
      >
        Tu posición: <strong>#{{ yourRank }}</strong>
      </div>

      <table class="w-full text-sm" aria-label="Tabla de posiciones">
        <thead>
          <tr class="border-b text-muted-foreground">
            <th class="py-2 pr-3 text-left font-medium w-10">#</th>
            <th class="py-2 text-left font-medium">Jugador</th>
            <th class="py-2 pl-3 text-right font-medium">EXP</th>
            <th class="py-2 pl-3 text-right font-medium">Nivel</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.userId"
            :class="[
              'border-b transition-colors',
              row.isCurrentUser ? 'bg-secondary/15 ring-1 ring-secondary/40' : 'hover:bg-muted/30',
            ]"
            :aria-current="row.isCurrentUser ? 'true' : undefined"
          >
            <td class="py-2 pr-3 font-mono font-bold text-muted-foreground">
              {{ row.rank }}
            </td>
            <td class="py-2">
              <div class="flex items-center gap-2">
                <div
                  class="h-7 w-7 rounded-sm bg-muted flex items-center justify-center text-xs font-bold shrink-0"
                  aria-hidden="true"
                >
                  {{ (row.displayName ?? row.userId).charAt(0).toUpperCase() }}
                </div>
                <span class="truncate">{{ row.displayName ?? row.userId }}</span>
                <span
                  v-if="row.isCurrentUser"
                  class="text-xs text-secondary font-pixel ml-1"
                  aria-label="Eres tú"
                >
                  ★
                </span>
              </div>
            </td>
            <td class="py-2 pl-3 text-right font-mono">{{ row.totalExp.toLocaleString() }}</td>
            <td class="py-2 pl-3 text-right font-mono">{{ row.level }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-between items-center mt-3 text-sm">
        <button
          type="button"
          class="px-3 py-1 rounded-md border hover:bg-muted disabled:opacity-40"
          :disabled="!hasPrev || loading"
          aria-label="Página anterior"
          @click="emit('prevPage')"
        >
          ← Anterior
        </button>
        <span class="text-muted-foreground">{{ page }} / {{ totalPages }}</span>
        <button
          type="button"
          class="px-3 py-1 rounded-md border hover:bg-muted disabled:opacity-40"
          :disabled="!hasNext || loading"
          aria-label="Página siguiente"
          @click="emit('nextPage')"
        >
          Siguiente →
        </button>
      </div>
    </template>
  </section>
</template>
