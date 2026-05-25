<script setup lang="ts">
import type { MangaEntry } from '@/composables/useManga';
import { BookOpen, CheckCircle2, Heart, TrendingUp, Euro } from 'lucide-vue-next';

interface Props {
  mangas: MangaEntry[];
}

const props = defineProps<Props>();

const stats = computed(() => {
  const total = props.mangas.length;
  const totalVolumes = props.mangas.reduce((sum, m) => sum + m.ownedVolumes.length, 0);
  const completed = props.mangas.filter((m) => m.status === 'completed').length;
  const wishlist = props.mangas.filter((m) => m.status === 'wishlist').length;
  const collecting = props.mangas.filter((m) => m.status === 'collecting').length;

  const totalCost = props.mangas.reduce((sum, m) => {
    const cost = m.totalCost ?? 0;
    return sum + cost;
  }, 0);

  return {
    total,
    totalVolumes,
    completed,
    wishlist,
    collecting,
    totalCost: Math.round(totalCost * 100) / 100,
  };
});

const NOTCH =
  'polygon(0 4px,4px 4px,4px 0,calc(100% - 4px) 0,calc(100% - 4px) 4px,100% 4px,100% calc(100% - 4px),calc(100% - 4px) calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,4px calc(100% - 4px),0 calc(100% - 4px))';

const CELLS = 10;

function filledCells(value: number) {
  return Math.max(0, Math.min(value, CELLS));
}

function displayValue(value: number) {
  return String(value).padStart(2, '0');
}
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
    <!-- Total series -->
    <Card
      class="crt-scanlines group relative overflow-hidden rounded-none border-2 border-primary/40 bg-card/40 hover:shadow-[0_0_24px_-6px_var(--color-primary)] transition-all duration-200"
    >
      <span
        class="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-primary/60"
        aria-hidden="true"
      />
      <span
        class="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-primary/60"
        aria-hidden="true"
      />
      <span
        class="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-primary/60"
        aria-hidden="true"
      />
      <span
        class="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-primary/60"
        aria-hidden="true"
      />
      <CardContent class="relative p-3">
        <div class="flex items-start justify-between gap-1.5">
          <div class="min-w-0 space-y-1">
            <p class="font-pixel text-[7px] text-muted-foreground/80 uppercase">SERIES</p>
            <p
              class="font-pixel text-2xl leading-none tabular-nums text-primary drop-shadow-[0_0_8px_currentColor]"
            >
              {{ displayValue(stats.total) }}
            </p>
          </div>
          <div
            class="pixelated grid place-items-center w-8 h-8 shrink-0 bg-primary/15 transition-transform duration-200 group-hover:scale-110"
            :style="{ clipPath: NOTCH }"
            aria-hidden="true"
          >
            <BookOpen class="h-3.5 w-3.5 text-primary" />
          </div>
        </div>
        <div class="mt-2 flex gap-0.5" aria-hidden="true">
          <span
            v-for="i in CELLS"
            :key="i"
            :class="[
              'h-1 flex-1 transition-colors duration-300',
              i <= filledCells(stats.total) ? 'bg-primary' : 'bg-white/10',
            ]"
          />
        </div>
      </CardContent>
    </Card>

    <!-- Total volumes -->
    <Card
      class="crt-scanlines group relative overflow-hidden rounded-none border-2 border-exp-easy/40 bg-card/40 hover:shadow-[0_0_24px_-6px_var(--color-exp-easy)] transition-all duration-200"
    >
      <span
        class="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-exp-easy/60"
        aria-hidden="true"
      />
      <span
        class="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-exp-easy/60"
        aria-hidden="true"
      />
      <span
        class="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-exp-easy/60"
        aria-hidden="true"
      />
      <span
        class="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-exp-easy/60"
        aria-hidden="true"
      />
      <CardContent class="relative p-3">
        <div class="flex items-start justify-between gap-1.5">
          <div class="min-w-0 space-y-1">
            <p class="font-pixel text-[7px] text-muted-foreground/80 uppercase">TOMOS</p>
            <p
              class="font-pixel text-2xl leading-none tabular-nums text-exp-easy drop-shadow-[0_0_8px_currentColor]"
            >
              {{ displayValue(stats.totalVolumes) }}
            </p>
          </div>
          <div
            class="pixelated grid place-items-center w-8 h-8 shrink-0 bg-exp-easy/15 transition-transform duration-200 group-hover:scale-110"
            :style="{ clipPath: NOTCH }"
            aria-hidden="true"
          >
            <BookOpen class="h-3.5 w-3.5 text-exp-easy" />
          </div>
        </div>
        <div class="mt-2 flex gap-0.5" aria-hidden="true">
          <span
            v-for="i in CELLS"
            :key="i"
            :class="[
              'h-1 flex-1 transition-colors duration-300',
              i <= filledCells(stats.totalVolumes) ? 'bg-exp-easy' : 'bg-white/10',
            ]"
          />
        </div>
      </CardContent>
    </Card>

    <!-- Completed -->
    <Card
      class="crt-scanlines group relative overflow-hidden rounded-none border-2 border-exp-legendary/40 bg-card/40 hover:shadow-[0_0_24px_-6px_var(--color-exp-legendary)] transition-all duration-200"
    >
      <span
        class="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-exp-legendary/60"
        aria-hidden="true"
      />
      <span
        class="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-exp-legendary/60"
        aria-hidden="true"
      />
      <span
        class="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-exp-legendary/60"
        aria-hidden="true"
      />
      <span
        class="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-exp-legendary/60"
        aria-hidden="true"
      />
      <CardContent class="relative p-3">
        <div class="flex items-start justify-between gap-1.5">
          <div class="min-w-0 space-y-1">
            <p class="font-pixel text-[7px] text-muted-foreground/80 uppercase">COMPLETAS</p>
            <p
              class="font-pixel text-2xl leading-none tabular-nums text-exp-legendary drop-shadow-[0_0_8px_currentColor]"
            >
              {{ displayValue(stats.completed) }}
            </p>
          </div>
          <div
            class="pixelated grid place-items-center w-8 h-8 shrink-0 bg-exp-legendary/15 transition-transform duration-200 group-hover:scale-110"
            :style="{ clipPath: NOTCH }"
            aria-hidden="true"
          >
            <CheckCircle2 class="h-3.5 w-3.5 text-exp-legendary" />
          </div>
        </div>
        <div class="mt-2 flex gap-0.5" aria-hidden="true">
          <span
            v-for="i in CELLS"
            :key="i"
            :class="[
              'h-1 flex-1 transition-colors duration-300',
              i <= filledCells(stats.completed) ? 'bg-exp-legendary' : 'bg-white/10',
            ]"
          />
        </div>
      </CardContent>
    </Card>

    <!-- Collecting -->
    <Card
      class="crt-scanlines group relative overflow-hidden rounded-none border-2 border-secondary/40 bg-card/40 hover:shadow-[0_0_24px_-6px_var(--color-secondary)] transition-all duration-200"
    >
      <span
        class="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-secondary/60"
        aria-hidden="true"
      />
      <span
        class="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-secondary/60"
        aria-hidden="true"
      />
      <span
        class="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-secondary/60"
        aria-hidden="true"
      />
      <span
        class="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-secondary/60"
        aria-hidden="true"
      />
      <CardContent class="relative p-3">
        <div class="flex items-start justify-between gap-1.5">
          <div class="min-w-0 space-y-1">
            <p class="font-pixel text-[7px] text-muted-foreground/80 uppercase">EN CURSO</p>
            <p
              class="font-pixel text-2xl leading-none tabular-nums text-secondary drop-shadow-[0_0_8px_currentColor]"
            >
              {{ displayValue(stats.collecting) }}
            </p>
          </div>
          <div
            class="pixelated grid place-items-center w-8 h-8 shrink-0 bg-secondary/15 transition-transform duration-200 group-hover:scale-110"
            :style="{ clipPath: NOTCH }"
            aria-hidden="true"
          >
            <TrendingUp class="h-3.5 w-3.5 text-secondary" />
          </div>
        </div>
        <div class="mt-2 flex gap-0.5" aria-hidden="true">
          <span
            v-for="i in CELLS"
            :key="i"
            :class="[
              'h-1 flex-1 transition-colors duration-300',
              i <= filledCells(stats.collecting) ? 'bg-secondary' : 'bg-white/10',
            ]"
          />
        </div>
      </CardContent>
    </Card>

    <!-- Wishlist -->
    <Card
      class="crt-scanlines group relative overflow-hidden rounded-none border-2 border-accent/40 bg-card/40 hover:shadow-[0_0_24px_-6px_var(--color-accent)] transition-all duration-200"
    >
      <span
        class="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-accent/60"
        aria-hidden="true"
      />
      <span
        class="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-accent/60"
        aria-hidden="true"
      />
      <span
        class="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-accent/60"
        aria-hidden="true"
      />
      <span
        class="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-accent/60"
        aria-hidden="true"
      />
      <CardContent class="relative p-3">
        <div class="flex items-start justify-between gap-1.5">
          <div class="min-w-0 space-y-1">
            <p class="font-pixel text-[7px] text-muted-foreground/80 uppercase">WISHLIST</p>
            <p
              class="font-pixel text-2xl leading-none tabular-nums text-accent drop-shadow-[0_0_8px_currentColor]"
            >
              {{ displayValue(stats.wishlist) }}
            </p>
          </div>
          <div
            class="pixelated grid place-items-center w-8 h-8 shrink-0 bg-accent/15 transition-transform duration-200 group-hover:scale-110"
            :style="{ clipPath: NOTCH }"
            aria-hidden="true"
          >
            <Heart class="h-3.5 w-3.5 text-accent" />
          </div>
        </div>
        <div class="mt-2 flex gap-0.5" aria-hidden="true">
          <span
            v-for="i in CELLS"
            :key="i"
            :class="[
              'h-1 flex-1 transition-colors duration-300',
              i <= filledCells(stats.wishlist) ? 'bg-accent' : 'bg-white/10',
            ]"
          />
        </div>
      </CardContent>
    </Card>

    <!-- Total cost -->
    <Card
      class="crt-scanlines group relative overflow-hidden rounded-none border-2 border-exp-medium/40 bg-card/40 hover:shadow-[0_0_24px_-6px_var(--color-exp-medium)] transition-all duration-200"
    >
      <span
        class="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-exp-medium/60"
        aria-hidden="true"
      />
      <span
        class="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-exp-medium/60"
        aria-hidden="true"
      />
      <span
        class="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-exp-medium/60"
        aria-hidden="true"
      />
      <span
        class="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-exp-medium/60"
        aria-hidden="true"
      />
      <CardContent class="relative p-3">
        <div class="flex items-start justify-between gap-1.5">
          <div class="min-w-0 space-y-1">
            <p class="font-pixel text-[7px] text-muted-foreground/80 uppercase">COSTE</p>
            <p
              class="font-pixel text-xl leading-none tabular-nums text-exp-medium drop-shadow-[0_0_8px_currentColor]"
            >
              {{ stats.totalCost.toFixed(0) }}<span class="text-base">€</span>
            </p>
          </div>
          <div
            class="pixelated grid place-items-center w-8 h-8 shrink-0 bg-exp-medium/15 transition-transform duration-200 group-hover:scale-110"
            :style="{ clipPath: NOTCH }"
            aria-hidden="true"
          >
            <Euro class="h-3.5 w-3.5 text-exp-medium" />
          </div>
        </div>
        <div class="mt-2 flex gap-0.5" aria-hidden="true">
          <span v-for="i in CELLS" :key="i" class="h-1 flex-1 bg-white/10" />
        </div>
      </CardContent>
    </Card>
  </div>
</template>
