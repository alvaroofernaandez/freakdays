<script setup lang="ts">
import { Play, CheckCircle2, Tv } from 'lucide-vue-next';

interface Props {
  watching: number;
  completed: number;
  total: number;
}

defineProps<Props>();

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
  <div class="grid grid-cols-3 gap-2 sm:gap-3">
    <!-- Watching -->
    <Card
      class="crt-scanlines group relative overflow-hidden rounded-none border-2 border-primary/40 bg-card/40 hover:shadow-[0_0_30px_-6px_var(--color-primary)] transition-all duration-200"
    >
      <span
        class="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary/60"
        aria-hidden="true"
      />
      <span
        class="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary/60"
        aria-hidden="true"
      />
      <span
        class="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary/60"
        aria-hidden="true"
      />
      <span
        class="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary/60"
        aria-hidden="true"
      />
      <CardContent class="relative p-4 sm:p-5">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 space-y-1.5">
            <p
              class="flex items-center gap-1.5 font-pixel text-[8px] text-muted-foreground/80 uppercase tracking-wider"
            >
              <span
                class="inline-block w-1.5 h-1.5 bg-primary motion-safe:animate-pulse"
                aria-hidden="true"
              />
              EN CURSO
            </p>
            <p
              class="font-pixel text-3xl sm:text-4xl leading-none tabular-nums text-primary drop-shadow-[0_0_12px_currentColor]"
            >
              {{ displayValue(watching) }}
            </p>
          </div>
          <div
            class="pixelated grid place-items-center w-11 h-11 shrink-0 bg-primary/15 transition-transform duration-200 group-hover:scale-110"
            :style="{ clipPath: NOTCH }"
            aria-hidden="true"
          >
            <Play class="h-5 w-5 text-primary" />
          </div>
        </div>
        <div class="mt-3 flex gap-1" aria-hidden="true">
          <span
            v-for="i in CELLS"
            :key="i"
            :class="[
              'h-1.5 flex-1 transition-colors duration-300',
              i <= filledCells(watching) ? 'bg-primary' : 'bg-white/10',
            ]"
          />
        </div>
      </CardContent>
    </Card>

    <!-- Completed -->
    <Card
      class="crt-scanlines group relative overflow-hidden rounded-none border-2 border-exp-easy/40 bg-card/40 hover:shadow-[0_0_30px_-6px_var(--color-exp-easy)] transition-all duration-200"
    >
      <span
        class="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-exp-easy/60"
        aria-hidden="true"
      />
      <span
        class="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-exp-easy/60"
        aria-hidden="true"
      />
      <span
        class="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-exp-easy/60"
        aria-hidden="true"
      />
      <span
        class="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-exp-easy/60"
        aria-hidden="true"
      />
      <CardContent class="relative p-4 sm:p-5">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 space-y-1.5">
            <p
              class="flex items-center gap-1.5 font-pixel text-[8px] text-muted-foreground/80 uppercase tracking-wider"
            >
              <span
                class="inline-block w-1.5 h-1.5 bg-exp-easy motion-safe:animate-pulse"
                aria-hidden="true"
              />
              VISTOS
            </p>
            <p
              class="font-pixel text-3xl sm:text-4xl leading-none tabular-nums text-exp-easy drop-shadow-[0_0_12px_currentColor]"
            >
              {{ displayValue(completed) }}
            </p>
          </div>
          <div
            class="pixelated grid place-items-center w-11 h-11 shrink-0 bg-exp-easy/15 transition-transform duration-200 group-hover:scale-110"
            :style="{ clipPath: NOTCH }"
            aria-hidden="true"
          >
            <CheckCircle2 class="h-5 w-5 text-exp-easy" />
          </div>
        </div>
        <div class="mt-3 flex gap-1" aria-hidden="true">
          <span
            v-for="i in CELLS"
            :key="i"
            :class="[
              'h-1.5 flex-1 transition-colors duration-300',
              i <= filledCells(completed) ? 'bg-exp-easy' : 'bg-white/10',
            ]"
          />
        </div>
      </CardContent>
    </Card>

    <!-- Total -->
    <Card
      class="crt-scanlines group relative overflow-hidden rounded-none border-2 border-accent/40 bg-card/40 hover:shadow-[0_0_30px_-6px_var(--color-accent)] transition-all duration-200"
    >
      <span
        class="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-accent/60"
        aria-hidden="true"
      />
      <span
        class="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-accent/60"
        aria-hidden="true"
      />
      <span
        class="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-accent/60"
        aria-hidden="true"
      />
      <span
        class="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-accent/60"
        aria-hidden="true"
      />
      <CardContent class="relative p-4 sm:p-5">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 space-y-1.5">
            <p
              class="flex items-center gap-1.5 font-pixel text-[8px] text-muted-foreground/80 uppercase tracking-wider"
            >
              <span
                class="inline-block w-1.5 h-1.5 bg-accent motion-safe:animate-pulse"
                aria-hidden="true"
              />
              TOTAL
            </p>
            <p
              class="font-pixel text-3xl sm:text-4xl leading-none tabular-nums text-accent drop-shadow-[0_0_12px_currentColor]"
            >
              {{ displayValue(total) }}
            </p>
          </div>
          <div
            class="pixelated grid place-items-center w-11 h-11 shrink-0 bg-accent/15 transition-transform duration-200 group-hover:scale-110"
            :style="{ clipPath: NOTCH }"
            aria-hidden="true"
          >
            <Tv class="h-5 w-5 text-accent" />
          </div>
        </div>
        <div class="mt-3 flex gap-1" aria-hidden="true">
          <span
            v-for="i in CELLS"
            :key="i"
            :class="[
              'h-1.5 flex-1 transition-colors duration-300',
              i <= filledCells(total) ? 'bg-accent' : 'bg-white/10',
            ]"
          />
        </div>
      </CardContent>
    </Card>
  </div>
</template>
