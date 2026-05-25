<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Zap } from 'lucide-vue-next';

interface Props {
  level: number;
  currentExp: number;
  neededExp: number;
}

const props = defineProps<Props>();

const progress = computed(() => {
  if (props.neededExp === 0) return 100;
  return Math.min(100, (props.currentExp / props.neededExp) * 100);
});

// Segmented cells (same as StatCard power meter pattern)
const CELLS = 20;
const filledCells = computed(() => Math.round((progress.value / 100) * CELLS));
</script>

<template>
  <Card
    class="crt-scanlines relative rounded-none border-2 border-primary/30 bg-card/40 overflow-hidden hover:shadow-[0_0_30px_-6px_var(--color-primary)] transition-all duration-200"
  >
    <!-- HUD targeting brackets -->
    <span
      class="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary/50"
      aria-hidden="true"
    />
    <span
      class="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary/50"
      aria-hidden="true"
    />
    <span
      class="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary/50"
      aria-hidden="true"
    />
    <span
      class="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary/50"
      aria-hidden="true"
    />

    <CardContent class="relative p-5">
      <p
        class="flex items-center gap-1.5 font-pixel text-[8px] text-primary/80 uppercase tracking-wider mb-4"
      >
        <Zap class="h-3 w-3 text-primary" aria-hidden="true" />
        PROGRESO AL SIGUIENTE NIVEL
      </p>

      <div class="space-y-3">
        <div class="flex justify-between font-pixel text-[8px]">
          <span class="text-muted-foreground">NIVEL {{ level }}</span>
          <span class="text-primary">{{ currentExp }} / {{ neededExp }} EXP</span>
          <span class="text-muted-foreground">NIVEL {{ level + 1 }}</span>
        </div>

        <Tooltip>
          <TooltipTrigger as-child>
            <div
              class="w-full"
              role="progressbar"
              :aria-valuenow="Math.round(progress)"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-label="`Progreso de EXP: ${currentExp} de ${neededExp}`"
            >
              <!-- Segmented XP bar (login pattern) -->
              <div class="relative h-3 bg-white/10 ring-1 ring-white/10 overflow-hidden">
                <div
                  class="h-full bg-linear-to-r from-primary via-accent to-primary motion-safe:transition-[width] motion-safe:duration-[1200ms] motion-safe:ease-out"
                  :style="{ width: `${progress}%` }"
                />
                <div
                  class="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0_8px,var(--color-background)_8px_11px)]"
                  aria-hidden="true"
                />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{{ currentExp }} / {{ neededExp }} EXP para el siguiente nivel</p>
          </TooltipContent>
        </Tooltip>

        <!-- Power meter cells -->
        <div class="flex gap-0.5" aria-hidden="true">
          <span
            v-for="i in CELLS"
            :key="i"
            :class="[
              'h-1 flex-1 transition-colors duration-300',
              i <= filledCells ? 'bg-primary' : 'bg-white/10',
            ]"
          />
        </div>

        <p class="text-center font-pixel text-[8px] text-muted-foreground/70">
          FALTAN
          <span class="text-primary">{{ neededExp - currentExp }} EXP</span>
          PARA NIVEL {{ level + 1 }}
        </p>
      </div>
    </CardContent>
  </Card>
</template>
