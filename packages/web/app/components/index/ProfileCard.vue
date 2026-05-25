<script setup lang="ts">
import { Target, Trophy, Hexagon } from 'lucide-vue-next';
import type { UserProfile } from '@/composables/useProfile';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface Props {
  profile: UserProfile;
  expProgress: {
    current: number;
    needed: number;
    progress: number;
  };
}

defineProps<Props>();
</script>

<template>
  <Card
    class="relative overflow-hidden border-primary/30 bg-primary/5 shadow-[0_0_22px_-8px_var(--color-primary)]"
  >
    <CardContent class="relative p-5">
      <div class="flex items-center gap-5">
        <!-- Level hexagon badge -->
        <div class="relative flex-shrink-0">
          <div
            class="pixelated grid h-16 w-16 place-items-center bg-linear-to-br from-primary via-accent to-secondary shadow-[0_0_22px_-6px_var(--color-primary)] [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]"
          >
            <span class="font-pixel text-[13px] text-white drop-shadow-sm">{{
              profile.level
            }}</span>
          </div>
          <!-- Pixel sparkle -->
          <span
            class="pixelated absolute -top-0.5 -right-0.5 h-2 w-2 bg-accent motion-safe:animate-pulse"
            aria-hidden="true"
          />
        </div>

        <div class="flex-1 space-y-2.5 min-w-0">
          <!-- Level label + EXP numbers -->
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-1.5">
              <Hexagon class="h-4 w-4 text-primary" aria-hidden="true" />
              <span class="font-pixel text-[9px] text-foreground uppercase"
                >NIVEL {{ profile.level }}</span
              >
            </div>
            <span class="font-pixel text-[8px] text-muted-foreground tabular-nums">
              {{ expProgress.current }} / {{ expProgress.needed }} EXP
            </span>
          </div>

          <!-- Segmented EXP bar -->
          <Tooltip>
            <TooltipTrigger as-child>
              <div class="w-full cursor-pointer">
                <div class="relative h-3 w-full overflow-hidden bg-white/10 ring-1 ring-white/10">
                  <div
                    class="h-full bg-linear-to-r from-primary via-accent to-secondary transition-all duration-300 ease-in-out"
                    :style="{ width: `${expProgress.progress}%` }"
                  />
                  <div
                    class="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0_8px,var(--color-background)_8px_11px)] pointer-events-none"
                  />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {{ expProgress.current }} / {{ expProgress.needed }} EXP para el siguiente nivel
              </p>
            </TooltipContent>
          </Tooltip>

          <!-- Stats row -->
          <div class="flex items-center gap-4 text-muted-foreground">
            <div class="flex items-center gap-1.5">
              <Trophy class="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span class="font-pixel text-[8px]">{{ profile.totalExp }} EXP total</span>
            </div>
            <div class="flex items-center gap-1.5">
              <Target class="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              <span class="font-pixel text-[8px]"
                >{{ expProgress.needed - expProgress.current }} para subir</span
              >
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
