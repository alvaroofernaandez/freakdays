<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Play, CheckCircle2, Tv } from 'lucide-vue-next'

interface Props {
  watching: number
  completed: number
  total: number
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
            <Play class="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <div class="text-xl sm:text-2xl font-bold text-primary leading-none">{{ watching }}</div>
          <div class="text-[10px] sm:text-xs text-muted-foreground/90 font-medium uppercase tracking-wide">En curso</div>
        </div>
      </CardContent>
    </Card>

    <Card class="group relative overflow-hidden border-exp-easy/30 bg-gradient-to-br from-exp-easy/15 via-exp-easy/10 to-exp-easy/5 hover:border-exp-easy/50 hover:shadow-md hover:shadow-exp-easy/10 transition-all duration-300">
      <div class="absolute inset-0 bg-gradient-to-br from-exp-easy/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div class="absolute top-0 right-0 w-20 h-20 bg-exp-easy/10 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
      <CardContent class="relative text-center py-3 sm:py-4 px-2 sm:px-3">
        <div class="flex flex-col items-center gap-1.5 sm:gap-2">
          <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-exp-easy/20 backdrop-blur-sm border border-exp-easy/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-exp-easy/30 transition-all duration-300">
            <CheckCircle2 class="h-4 w-4 sm:h-5 sm:w-5 text-exp-easy" />
          </div>
          <div class="text-xl sm:text-2xl font-bold text-exp-easy leading-none">{{ completed }}</div>
          <div class="text-[10px] sm:text-xs text-muted-foreground/90 font-medium uppercase tracking-wide">Vistos</div>
        </div>
      </CardContent>
    </Card>

    <Card class="group relative overflow-hidden border-exp-legendary/30 bg-gradient-to-br from-exp-legendary/15 via-exp-legendary/10 to-exp-legendary/5 hover:border-exp-legendary/50 hover:shadow-md hover:shadow-exp-legendary/10 transition-all duration-300">
      <div class="absolute inset-0 bg-gradient-to-br from-exp-legendary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div class="absolute top-0 right-0 w-20 h-20 bg-exp-legendary/10 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
      <CardContent class="relative text-center py-3 sm:py-4 px-2 sm:px-3">
        <div class="flex flex-col items-center gap-1.5 sm:gap-2">
          <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-exp-legendary/20 backdrop-blur-sm border border-exp-legendary/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-exp-legendary/30 transition-all duration-300">
            <Tv class="h-4 w-4 sm:h-5 sm:w-5 text-exp-legendary" />
          </div>
          <div class="text-xl sm:text-2xl font-bold text-exp-legendary leading-none">{{ total }}</div>
          <div class="text-[10px] sm:text-xs text-muted-foreground/90 font-medium uppercase tracking-wide">Total</div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

