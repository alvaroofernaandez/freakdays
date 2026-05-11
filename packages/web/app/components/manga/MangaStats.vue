<script setup lang="ts">
import type { MangaEntry } from '@/composables/useManga'
import { BookOpen, CheckCircle2, Heart, TrendingUp, Euro } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  mangas: MangaEntry[]
}

const props = defineProps<Props>()

const stats = computed(() => {
    const total = props.mangas.length
    const totalVolumes = props.mangas.reduce((sum, m) => sum + m.ownedVolumes.length, 0)
    const completed = props.mangas.filter(m => m.status === 'completed').length
    const wishlist = props.mangas.filter(m => m.status === 'wishlist').length
    const collecting = props.mangas.filter(m => m.status === 'collecting').length
    
    const totalCost = props.mangas.reduce((sum, m) => {
      const cost = m.totalCost ?? 0
      return sum + cost
    }, 0)

    return {
      total,
      totalVolumes,
      completed,
      wishlist,
      collecting,
      totalCost: Math.round(totalCost * 100) / 100,
    }
  })
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
    <Card class="group relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 hover:border-primary/50 hover:shadow-md hover:shadow-primary/10 transition-all duration-300">
      <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div class="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
      <CardContent class="relative text-center py-3 px-2 sm:px-3">
        <div class="flex flex-col items-center gap-1.5">
          <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/30 transition-all duration-300">
            <BookOpen class="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
          </div>
          <div class="text-xl sm:text-2xl font-bold text-primary leading-none">{{ stats.total }}</div>
          <div class="text-[10px] sm:text-xs text-muted-foreground/90 font-medium uppercase tracking-wide">Series</div>
        </div>
      </CardContent>
    </Card>

    <Card class="group relative overflow-hidden border-exp-easy/30 bg-gradient-to-br from-exp-easy/15 via-exp-easy/10 to-exp-easy/5 hover:border-exp-easy/50 hover:shadow-md hover:shadow-exp-easy/10 transition-all duration-300">
      <div class="absolute inset-0 bg-gradient-to-br from-exp-easy/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div class="absolute top-0 right-0 w-16 h-16 bg-exp-easy/10 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
      <CardContent class="relative text-center py-3 px-2 sm:px-3">
        <div class="flex flex-col items-center gap-1.5">
          <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-exp-easy/20 backdrop-blur-sm border border-exp-easy/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-exp-easy/30 transition-all duration-300">
            <BookOpen class="h-3.5 w-3.5 sm:h-4 sm:w-4 text-exp-easy" />
          </div>
          <div class="text-xl sm:text-2xl font-bold text-exp-easy leading-none">{{ stats.totalVolumes }}</div>
          <div class="text-[10px] sm:text-xs text-muted-foreground/90 font-medium uppercase tracking-wide">Tomos</div>
        </div>
      </CardContent>
    </Card>

    <Card class="group relative overflow-hidden border-exp-legendary/30 bg-gradient-to-br from-exp-legendary/15 via-exp-legendary/10 to-exp-legendary/5 hover:border-exp-legendary/50 hover:shadow-md hover:shadow-exp-legendary/10 transition-all duration-300">
      <div class="absolute inset-0 bg-gradient-to-br from-exp-legendary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div class="absolute top-0 right-0 w-16 h-16 bg-exp-legendary/10 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
      <CardContent class="relative text-center py-3 px-2 sm:px-3">
        <div class="flex flex-col items-center gap-1.5">
          <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-exp-legendary/20 backdrop-blur-sm border border-exp-legendary/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-exp-legendary/30 transition-all duration-300">
            <CheckCircle2 class="h-3.5 w-3.5 sm:h-4 sm:w-4 text-exp-legendary" />
          </div>
          <div class="text-xl sm:text-2xl font-bold text-exp-legendary leading-none">{{ stats.completed }}</div>
          <div class="text-[10px] sm:text-xs text-muted-foreground/90 font-medium uppercase tracking-wide">Completas</div>
        </div>
      </CardContent>
    </Card>

    <Card class="group relative overflow-hidden border-secondary/30 bg-gradient-to-br from-secondary/15 via-secondary/10 to-secondary/5 hover:border-secondary/50 hover:shadow-md hover:shadow-secondary/10 transition-all duration-300">
      <div class="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div class="absolute top-0 right-0 w-16 h-16 bg-secondary/10 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
      <CardContent class="relative text-center py-3 px-2 sm:px-3">
        <div class="flex flex-col items-center gap-1.5">
          <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-secondary/20 backdrop-blur-sm border border-secondary/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-secondary/30 transition-all duration-300">
            <TrendingUp class="h-3.5 w-3.5 sm:h-4 sm:w-4 text-secondary" />
          </div>
          <div class="text-xl sm:text-2xl font-bold text-secondary leading-none">{{ stats.collecting }}</div>
          <div class="text-[10px] sm:text-xs text-muted-foreground/90 font-medium uppercase tracking-wide">En curso</div>
        </div>
      </CardContent>
    </Card>

    <Card class="group relative overflow-hidden border-accent/30 bg-gradient-to-br from-accent/15 via-accent/10 to-accent/5 hover:border-accent/50 hover:shadow-md hover:shadow-accent/10 transition-all duration-300">
      <div class="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div class="absolute top-0 right-0 w-16 h-16 bg-accent/10 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
      <CardContent class="relative text-center py-3 px-2 sm:px-3">
        <div class="flex flex-col items-center gap-1.5">
          <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-accent/20 backdrop-blur-sm border border-accent/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-accent/30 transition-all duration-300">
            <Heart class="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent" />
          </div>
          <div class="text-xl sm:text-2xl font-bold text-accent leading-none">{{ stats.wishlist }}</div>
          <div class="text-[10px] sm:text-xs text-muted-foreground/90 font-medium uppercase tracking-wide">Wishlist</div>
        </div>
      </CardContent>
    </Card>

    <Card class="group relative overflow-hidden border-exp-medium/30 bg-gradient-to-br from-exp-medium/15 via-exp-medium/10 to-exp-medium/5 hover:border-exp-medium/50 hover:shadow-md hover:shadow-exp-medium/10 transition-all duration-300">
      <div class="absolute inset-0 bg-gradient-to-br from-exp-medium/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div class="absolute top-0 right-0 w-16 h-16 bg-exp-medium/10 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
      <CardContent class="relative text-center py-3 px-2 sm:px-3">
        <div class="flex flex-col items-center gap-1.5">
          <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-exp-medium/20 backdrop-blur-sm border border-exp-medium/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-exp-medium/30 transition-all duration-300">
            <Euro class="h-3.5 w-3.5 sm:h-4 sm:w-4 text-exp-medium" />
          </div>
          <div class="text-xl sm:text-2xl font-bold text-exp-medium leading-none">{{ stats.totalCost.toFixed(2) }}€</div>
          <div class="text-[10px] sm:text-xs text-muted-foreground/90 font-medium uppercase tracking-wide">Total</div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

