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

/** Rank medal classes: gold / silver / bronze for top 3 */
function rankAccentClass(rank: number): string {
  if (rank === 1) return 'text-exp-medium';
  if (rank === 2) return 'text-muted-foreground';
  if (rank === 3) return 'text-exp-hard';
  return 'text-muted-foreground';
}

/** Rank medal label for a11y */
function rankLabel(rank: number): string {
  if (rank === 1) return '1er lugar';
  if (rank === 2) return '2do lugar';
  if (rank === 3) return '3er lugar';
  return `Posición ${rank}`;
}
</script>

<template>
  <section aria-label="Leaderboard">
    <!-- Loading skeleton -->
    <div
      v-if="loading && rows.length === 0"
      class="border-2 border-border/50 p-6 text-center space-y-2"
      role="status"
      aria-live="polite"
      aria-label="Cargando clasificación"
    >
      <p
        class="font-pixel text-[8px] text-primary uppercase tracking-widest motion-safe:animate-pulse"
      >
        ▸ CARGANDO…
      </p>
    </div>

    <!-- Empty state -->
    <div v-else-if="rows.length === 0" class="border-2 border-border/50 p-8 text-center space-y-3">
      <p class="font-pixel text-[9px] text-muted-foreground uppercase tracking-widest">
        — SIN PARTICIPANTES AÚN —
      </p>
      <p class="text-xs text-muted-foreground/60">
        Activa tu participación en el leaderboard global desde tu perfil.
      </p>
    </div>

    <template v-else>
      <!-- Off-page yourRank banner -->
      <div
        v-if="isOffPage && yourRank !== null"
        class="mb-3 px-3 py-2 border-2 border-accent/40 bg-accent/5"
        style="box-shadow: 0 0 8px oklch(0.75 0.18 190 / 0.15)"
        role="status"
        aria-live="polite"
      >
        <span class="font-pixel text-[8px] text-accent uppercase tracking-widest">
          TU POSICIÓN: <strong class="text-foreground">#{{ yourRank }}</strong>
        </span>
      </div>

      <!-- Scoreboard container -->
      <div
        class="border-2 border-border/60 overflow-hidden"
        style="box-shadow: 0 0 16px oklch(0.65 0.25 290 / 0.12)"
      >
        <table class="w-full text-sm" aria-label="Tabla de posiciones">
          <thead>
            <tr class="border-b-2 border-border/60 bg-card/60">
              <th
                class="py-2 px-3 text-left font-pixel text-[8px] uppercase tracking-widest text-muted-foreground w-10"
                scope="col"
              >
                #
              </th>
              <th
                class="py-2 text-left font-pixel text-[8px] uppercase tracking-widest text-muted-foreground"
                scope="col"
              >
                Jugador
              </th>
              <th
                class="py-2 px-3 text-right font-pixel text-[8px] uppercase tracking-widest text-muted-foreground"
                scope="col"
              >
                EXP
              </th>
              <th
                class="py-2 px-3 text-right font-pixel text-[8px] uppercase tracking-widest text-muted-foreground"
                scope="col"
              >
                LV
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in rows"
              :key="row.userId"
              :class="[
                'border-b border-border/30 transition-colors motion-safe:transition-colors',
                row.isCurrentUser ? 'bg-accent/10 border-l-2 border-l-accent' : 'hover:bg-muted/20',
              ]"
              :style="
                row.isCurrentUser
                  ? 'box-shadow: inset 0 0 12px oklch(0.75 0.18 190 / 0.08)'
                  : undefined
              "
              :aria-current="row.isCurrentUser ? 'true' : undefined"
            >
              <!-- Rank -->
              <td class="py-2.5 px-3">
                <span
                  :class="[
                    'font-pixel font-bold tabular-nums',
                    row.rank <= 3 ? 'text-base' : 'text-[10px]',
                    rankAccentClass(row.rank),
                  ]"
                  :aria-label="rankLabel(row.rank)"
                >
                  {{ row.rank }}
                </span>
              </td>

              <!-- Player -->
              <td class="py-2.5">
                <div class="flex items-center gap-2">
                  <!-- Avatar -->
                  <div
                    class="h-7 w-7 shrink-0 overflow-hidden border border-border/50"
                    :class="row.isCurrentUser ? 'border-accent/60' : ''"
                    aria-hidden="true"
                  >
                    <img
                      v-if="row.avatarUrl"
                      :src="row.avatarUrl"
                      :alt="row.displayName ?? row.userId"
                      class="h-full w-full object-cover pixelated"
                      loading="lazy"
                    />
                    <div
                      v-else
                      class="h-full w-full bg-muted flex items-center justify-center text-xs font-bold"
                      :class="
                        row.isCurrentUser ? 'bg-accent/20 text-accent' : 'text-muted-foreground'
                      "
                    >
                      {{ (row.displayName ?? row.userId).charAt(0).toUpperCase() }}
                    </div>
                  </div>

                  <!-- Name -->
                  <span class="truncate text-sm">
                    {{ row.displayName ?? row.userId }}
                  </span>

                  <!-- Current-user marker -->
                  <span
                    v-if="row.isCurrentUser"
                    class="font-pixel text-[7px] text-accent uppercase tracking-widest ml-1 shrink-0"
                    aria-label="Eres tú"
                  >
                    ★ TÚ
                  </span>
                </div>
              </td>

              <!-- EXP -->
              <td class="py-2.5 px-3 text-right font-mono tabular-nums text-sm">
                {{ row.totalExp.toLocaleString() }}
              </td>

              <!-- Level -->
              <td class="py-2.5 px-3 text-right font-mono tabular-nums text-sm">
                {{ row.level }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-between items-center mt-3 gap-3">
        <button
          type="button"
          :class="[
            'btn-game px-3 py-2 border-2 border-border/60 bg-card/60 font-pixel text-[8px] uppercase tracking-widest',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer',
            'hover:border-primary/60 hover:bg-primary/5',
          ]"
          :disabled="!hasPrev || loading"
          aria-label="Página anterior"
          @click="emit('prevPage')"
        >
          ← PREV
        </button>

        <span
          class="font-pixel text-[8px] text-muted-foreground uppercase tracking-widest tabular-nums"
        >
          {{ page }} / {{ totalPages }}
        </span>

        <button
          type="button"
          :class="[
            'btn-game px-3 py-2 border-2 border-border/60 bg-card/60 font-pixel text-[8px] uppercase tracking-widest',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer',
            'hover:border-primary/60 hover:bg-primary/5',
          ]"
          :disabled="!hasNext || loading"
          aria-label="Página siguiente"
          @click="emit('nextPage')"
        >
          NEXT →
        </button>
      </div>
    </template>
  </section>
</template>
