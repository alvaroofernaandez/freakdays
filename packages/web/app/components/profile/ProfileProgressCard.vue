<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Zap } from 'lucide-vue-next'

interface Props {
  level: number
  currentExp: number
  neededExp: number
}

const props = defineProps<Props>()

const progress = computed(() => {
  if (props.neededExp === 0) return 100
  return Math.min(100, (props.currentExp / props.neededExp) * 100)
})
</script>

<template>
  <Card
    class="relative overflow-hidden border-primary/20 bg-linear-to-br from-primary/5 via-background to-accent/5"
  >
    <div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Zap class="h-5 w-5 text-primary" />
        Progreso al siguiente nivel
      </CardTitle>
    </CardHeader>
    <CardContent class="relative">
      <div class="space-y-4">
        <div class="flex justify-between text-sm font-medium">
          <span class="text-muted-foreground">Nivel {{ level }}</span>
          <span class="text-primary">{{ currentExp }} / {{ neededExp }} EXP</span>
          <span class="text-muted-foreground">Nivel {{ level + 1 }}</span>
        </div>
        <Tooltip>
          <TooltipTrigger as-child>
            <div class="w-full">
              <div class="h-4 bg-muted rounded-full overflow-hidden">
                <div
                  class="h-full bg-linear-to-r from-primary via-accent to-primary rounded-full transition-all duration-500"
                  :style="{ width: `${progress}%` }"
                />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{{ currentExp }} / {{ neededExp }} EXP para el siguiente nivel</p>
          </TooltipContent>
        </Tooltip>
        <p class="text-center text-sm text-muted-foreground">
          Te faltan <span class="font-semibold text-primary">{{ neededExp - currentExp }} EXP</span>
          para subir al nivel {{ level + 1 }}
        </p>
      </div>
    </CardContent>
  </Card>
</template>

