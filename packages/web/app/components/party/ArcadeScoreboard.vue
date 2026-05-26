<script setup lang="ts">
import type { LeaderboardRow } from '~~/stores/useLeaderboard';
import { cn } from '@/lib/utils';
import { Crown, Flame, Trophy } from 'lucide-vue-next';
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

/** Top-3 podium rows (only when page === 1) */
const podiumRows = computed(() => (props.page === 1 ? props.rows.filter((r) => r.rank <= 3) : []));

/** Rows below the podium (rank > 3), or all rows when page > 1 */
const tableRows = computed(() =>
  props.page === 1 ? props.rows.filter((r) => r.rank > 3) : [...props.rows],
);

/**
 * Display name: prefer displayName, fall back to @username (with @-prefix so a
 * raw id is clearly intentional and not a rendering artifact).
 */
function playerLabel(row: LeaderboardRow): string {
  if (row.displayName) return row.displayName;
  return `@${row.userId}`;
}

/** Initial letter for the avatar fallback */
function avatarInitial(row: LeaderboardRow): string {
  return playerLabel(row).replace('@', '').charAt(0).toUpperCase();
}

/** Rank label for a11y */
function rankLabel(rank: number): string {
  if (rank === 1) return '1er lugar';
  if (rank === 2) return '2do lugar';
  if (rank === 3) return '3er lugar';
  return `Posición ${rank}`;
}

interface PodiumStyle {
  border: string;
  badge: string;
  ring: string;
  shadow: string;
  label: string;
  avatarSize: string;
  order: number;
}

/** Gold — #1 */
const PODIUM_GOLD: PodiumStyle = {
  border: 'border-exp-medium',
  badge: 'bg-exp-medium text-background',
  ring: 'ring-2 ring-exp-medium',
  shadow: 'shadow-[0_0_20px_oklch(0.8_0.18_85_/_0.35)]',
  label: 'text-exp-medium',
  avatarSize: 'h-14 w-14',
  order: 2, // center
};

/** Silver — #2 */
const PODIUM_SILVER: PodiumStyle = {
  border: 'border-muted-foreground/70',
  badge: 'bg-muted-foreground/70 text-background',
  ring: 'ring-2 ring-muted-foreground/50',
  shadow: 'shadow-[0_0_12px_oklch(0.65_0.02_270_/_0.3)]',
  label: 'text-muted-foreground',
  avatarSize: 'h-11 w-11',
  order: 1, // left
};

/** Bronze — #3 */
const PODIUM_BRONZE: PodiumStyle = {
  border: 'border-exp-hard',
  badge: 'bg-exp-hard text-background',
  ring: 'ring-2 ring-exp-hard/60',
  shadow: 'shadow-[0_0_12px_oklch(0.7_0.2_45_/_0.25)]',
  label: 'text-exp-hard',
  avatarSize: 'h-10 w-10',
  order: 3, // right
};

/** Returns the podium style for rank 1/2/3; falls back to bronze. */
function podiumStyle(rank: number): PodiumStyle {
  if (rank === 1) return PODIUM_GOLD;
  if (rank === 2) return PODIUM_SILVER;
  return PODIUM_BRONZE;
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
    <div v-else-if="rows.length === 0" class="border-2 border-border/50 p-10 text-center space-y-3">
      <Trophy class="mx-auto h-10 w-10 text-muted-foreground/40" aria-hidden="true" />
      <p
        class="font-pixel text-[9px] text-muted-foreground uppercase tracking-widest leading-relaxed"
      >
        — AÚN NO HAY SUFICIENTES JUGADORES —
      </p>
      <p class="text-xs text-muted-foreground/60 max-w-xs mx-auto">
        Activa tu participación desde tu perfil para aparecer aquí.
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

      <!-- ── Podium (top 3, first page only) ─────────────────────── -->
      <div
        v-if="podiumRows.length > 0"
        class="mb-4 flex items-end justify-center gap-3 px-2"
        role="region"
        aria-label="Podio top 3"
      >
        <div
          v-for="row in podiumRows"
          :key="row.userId"
          :style="{ order: podiumStyle(row.rank).order }"
          :class="[
            'flex flex-col items-center gap-1.5 px-3 py-3 border-2 min-w-0 w-[30%] max-w-[140px]',
            podiumStyle(row.rank).border,
            podiumStyle(row.rank).shadow,
            row.isCurrentUser ? 'bg-accent/10' : 'bg-card/60',
          ]"
          :aria-label="rankLabel(row.rank)"
        >
          <!-- Crown for #1 -->
          <Crown
            v-if="row.rank === 1"
            class="h-4 w-4 text-exp-medium shrink-0"
            aria-hidden="true"
          />

          <!-- Rank badge -->
          <span
            :class="['font-pixel text-[8px] px-2 py-0.5 shrink-0', podiumStyle(row.rank).badge]"
            :aria-label="rankLabel(row.rank)"
          >
            #{{ row.rank }}
          </span>

          <!-- Avatar -->
          <div
            :class="[
              'shrink-0 overflow-hidden border rounded-none',
              podiumStyle(row.rank).avatarSize,
              podiumStyle(row.rank).ring,
              podiumStyle(row.rank).border,
            ]"
            aria-hidden="true"
          >
            <img
              v-if="row.avatarUrl"
              :src="row.avatarUrl"
              :alt="playerLabel(row)"
              class="h-full w-full object-cover pixelated"
              loading="lazy"
            />
            <div
              v-else
              :class="[
                'h-full w-full flex items-center justify-center text-xs font-bold',
                row.isCurrentUser ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground',
              ]"
            >
              {{ avatarInitial(row) }}
            </div>
          </div>

          <!-- Name -->
          <span
            :class="[
              'font-pixel text-[7px] truncate w-full text-center leading-snug',
              podiumStyle(row.rank).label,
            ]"
          >
            {{ playerLabel(row) }}
          </span>

          <!-- You marker -->
          <span
            v-if="row.isCurrentUser"
            class="font-pixel text-[6px] text-accent uppercase tracking-widest"
            aria-label="Eres tú"
          >
            ★ TÚ
          </span>

          <!-- EXP -->
          <span class="font-mono tabular-nums text-[10px] text-muted-foreground">
            {{ row.totalExp.toLocaleString() }} EXP
          </span>
        </div>
      </div>

      <!-- ── Scoreboard table ─────────────────────────────────────── -->
      <div
        :class="['border-2 border-border/60 overflow-x-auto']"
        style="box-shadow: 0 0 16px oklch(0.65 0.25 290 / 0.12)"
      >
        <table class="w-full min-w-[440px] text-sm" aria-label="Tabla de posiciones" role="table">
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
                class="py-2 px-3 text-right font-pixel text-[8px] uppercase tracking-widest text-muted-foreground hidden sm:table-cell"
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
              <th
                class="py-2 px-3 text-right font-pixel text-[8px] uppercase tracking-widest text-muted-foreground hidden sm:table-cell"
                scope="col"
                aria-label="Racha"
              >
                <Flame class="inline h-3 w-3" aria-hidden="true" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in tableRows"
              :key="row.userId"
              :class="
                cn(
                  'border-b border-border/30 motion-safe:transition-colors duration-150',
                  row.isCurrentUser
                    ? 'bg-accent/10 border-l-2 border-l-accent'
                    : 'hover:bg-muted/20',
                )
              "
              :style="
                row.isCurrentUser
                  ? 'box-shadow: inset 0 0 16px oklch(0.75 0.18 190 / 0.10)'
                  : undefined
              "
              :aria-current="row.isCurrentUser ? 'true' : undefined"
            >
              <!-- Rank -->
              <td class="py-2.5 px-3">
                <span
                  :class="
                    cn(
                      'font-pixel font-bold tabular-nums text-[10px]',
                      row.rank === 1 && 'text-exp-medium',
                      row.rank === 2 && 'text-muted-foreground',
                      row.rank === 3 && 'text-exp-hard',
                      row.rank > 3 && 'text-muted-foreground',
                    )
                  "
                  :aria-label="rankLabel(row.rank)"
                >
                  {{ row.rank }}
                </span>
              </td>

              <!-- Player -->
              <td class="py-2.5">
                <div class="flex items-center gap-2">
                  <!-- Avatar — rounded-none blocky frame -->
                  <div
                    :class="
                      cn(
                        'h-7 w-7 shrink-0 overflow-hidden border rounded-none',
                        row.isCurrentUser ? 'border-accent/60' : 'border-border/50',
                      )
                    "
                    aria-hidden="true"
                  >
                    <img
                      v-if="row.avatarUrl"
                      :src="row.avatarUrl"
                      :alt="playerLabel(row)"
                      class="h-full w-full object-cover pixelated"
                      loading="lazy"
                    />
                    <div
                      v-else
                      :class="
                        cn(
                          'h-full w-full flex items-center justify-center text-xs font-bold',
                          row.isCurrentUser
                            ? 'bg-accent/20 text-accent'
                            : 'bg-muted text-muted-foreground',
                        )
                      "
                    >
                      {{ avatarInitial(row) }}
                    </div>
                  </div>

                  <!-- Name -->
                  <span class="truncate text-sm">
                    {{ playerLabel(row) }}
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

              <!-- EXP — hidden on small screens -->
              <td
                class="py-2.5 px-3 text-right font-mono tabular-nums text-sm hidden sm:table-cell"
              >
                {{ row.totalExp.toLocaleString() }}
              </td>

              <!-- Level -->
              <td class="py-2.5 px-3 text-right font-mono tabular-nums text-sm">
                {{ row.level }}
              </td>

              <!-- Streak — hidden on small screens -->
              <td class="py-2.5 px-3 text-right hidden sm:table-cell">
                <span
                  v-if="row.currentStreak > 0"
                  class="inline-flex items-center gap-0.5 font-mono tabular-nums text-xs text-exp-hard"
                  :aria-label="`Racha de ${row.currentStreak} días`"
                >
                  <Flame class="h-3 w-3 shrink-0" aria-hidden="true" />
                  {{ row.currentStreak }}
                </span>
                <span v-else class="text-muted-foreground/40 text-xs">—</span>
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
