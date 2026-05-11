<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import type { AppModule } from '~~/domain/types'
import { getModuleIcon } from '~~/domain/constants/module-icons'

interface Props {
  module: AppModule
}

defineProps<Props>()
</script>

<template>
  <Card class="relative h-full transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 overflow-hidden group">
    <div class="absolute inset-0 bg-linear-to-br from-primary/5 via-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0" />
    <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0" />
    <CardHeader class="pb-3 relative z-10">
      <div class="flex items-center gap-4">
        <div class="relative flex-shrink-0">
          <div class="absolute inset-0 bg-primary/20 blur-lg rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div class="relative w-14 h-14 rounded-xl bg-linear-to-br from-primary/20 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-primary/20">
            <component :is="getModuleIcon(module.icon)" class="h-7 w-7 text-primary group-hover:text-accent transition-colors" />
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <CardTitle class="text-lg font-semibold truncate mb-1 group-hover:text-primary transition-colors">{{ module.name }}</CardTitle>
          <CardDescription class="text-sm line-clamp-2">{{ module.description }}</CardDescription>
        </div>
        <ChevronRight class="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
      </div>
    </CardHeader>
  </Card>
</template>

