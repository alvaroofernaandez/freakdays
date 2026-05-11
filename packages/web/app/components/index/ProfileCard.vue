<script setup lang="ts">
import { Zap, Target, Trophy } from 'lucide-vue-next'
import type { UserProfile } from '@/composables/useProfile'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

interface Props {
  profile: UserProfile
  expProgress: {
    current: number
    needed: number
    progress: number
  }
}

defineProps<Props>()
</script>

<template>
  <Card class="relative overflow-hidden border-primary/20 bg-linear-to-br from-primary/10 via-background to-exp-legendary/10">
    <div class="absolute top-0 right-0 w-64 h-64 bg-exp-legendary/10 rounded-full blur-3xl" />
    <div class="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
    <CardContent class="relative p-6">
      <div class="flex items-center gap-6">
        <div class="relative flex-shrink-0">
          <div class="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-pulse" />
          <div class="relative w-20 h-20 rounded-full bg-linear-to-br from-primary via-accent to-primary flex items-center justify-center shadow-lg border-2 border-primary/30">
            <span class="text-3xl font-bold text-white drop-shadow-lg">{{ profile.level }}</span>
          </div>
        </div>
        <div class="flex-1 space-y-3 min-w-0">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <Zap class="h-5 w-5 text-exp-legendary" />
              <span class="text-base font-semibold">Nivel {{ profile.level }}</span>
            </div>
            <span class="text-sm text-muted-foreground font-medium whitespace-nowrap">
              {{ expProgress.current }} / {{ expProgress.needed }} EXP
            </span>
          </div>
          <Tooltip>
            <TooltipTrigger as-child>
              <div class="w-full">
                <div class="relative h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    class="h-full bg-linear-to-r from-primary via-accent to-primary transition-all duration-300 ease-in-out"
                    :style="{ width: `${expProgress.progress}%` }"
                  />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{{ expProgress.current }} / {{ expProgress.needed }} EXP para el siguiente nivel</p>
            </TooltipContent>
          </Tooltip>
          <div class="flex items-center gap-6 text-sm text-muted-foreground">
            <div class="flex items-center gap-2">
              <Trophy class="h-4 w-4 text-exp-legendary" />
              <span class="font-medium">{{ profile.totalExp }} EXP total</span>
            </div>
            <div class="flex items-center gap-2">
              <Target class="h-4 w-4 text-primary" />
              <span>{{ expProgress.needed - expProgress.current }} para subir</span>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

