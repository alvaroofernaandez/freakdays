<script setup lang="ts">
import { Flame, Calendar, Timer } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  weeklyCount: number
  totalCount: number
  weeklyMinutes: number
}

defineProps<Props>()
</script>

<template>
  <div class="grid grid-cols-3 gap-2 sm:gap-3">
    <Card class="group relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 hover:border-primary/50 hover:shadow-md hover:shadow-primary/10 transition-all duration-300">
      <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div class="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
      <CardContent class="relative text-center py-3 sm:py-4 px-2 sm:px-3">
        <div class="flex flex-col items-center gap-1.5 sm:gap-2">
          <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/30 transition-all duration-300">
            <Calendar class="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <div class="text-xl sm:text-2xl font-bold text-primary leading-none">{{ weeklyCount }}</div>
          <div class="text-[10px] sm:text-xs text-muted-foreground/90 font-medium uppercase tracking-wide">Esta semana</div>
        </div>
      </CardContent>
    </Card>

    <Card class="group relative overflow-hidden border-exp-hard/30 bg-gradient-to-br from-exp-hard/15 via-exp-hard/10 to-exp-hard/5 hover:border-exp-hard/50 hover:shadow-md hover:shadow-exp-hard/10 transition-all duration-300">
      <div class="absolute inset-0 bg-gradient-to-br from-exp-hard/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div class="absolute top-0 right-0 w-20 h-20 bg-exp-hard/10 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
      <CardContent class="relative text-center py-3 sm:py-4 px-2 sm:px-3">
        <div class="flex flex-col items-center gap-1.5 sm:gap-2">
          <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-exp-hard/20 backdrop-blur-sm border border-exp-hard/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-exp-hard/30 transition-all duration-300">
            <Flame class="h-4 w-4 sm:h-5 sm:w-5 text-exp-hard" />
          </div>
          <div class="text-xl sm:text-2xl font-bold text-exp-hard leading-none">{{ totalCount }}</div>
          <div class="text-[10px] sm:text-xs text-muted-foreground/90 font-medium uppercase tracking-wide">Total</div>
        </div>
      </CardContent>
    </Card>

    <Card class="group relative overflow-hidden border-exp-easy/30 bg-gradient-to-br from-exp-easy/15 via-exp-easy/10 to-exp-easy/5 hover:border-exp-easy/50 hover:shadow-md hover:shadow-exp-easy/10 transition-all duration-300">
      <div class="absolute inset-0 bg-gradient-to-br from-exp-easy/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div class="absolute top-0 right-0 w-20 h-20 bg-exp-easy/10 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
      <CardContent class="relative text-center py-3 sm:py-4 px-2 sm:px-3">
        <div class="flex flex-col items-center gap-1.5 sm:gap-2">
          <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-exp-easy/20 backdrop-blur-sm border border-exp-easy/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-exp-easy/30 transition-all duration-300">
            <Timer class="h-4 w-4 sm:h-5 sm:w-5 text-exp-easy" />
          </div>
          <div class="text-xl sm:text-2xl font-bold text-exp-easy leading-none">{{ weeklyMinutes }}</div>
          <div class="text-[10px] sm:text-xs text-muted-foreground/90 font-medium uppercase tracking-wide">Min. semana</div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

