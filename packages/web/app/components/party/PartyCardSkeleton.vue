<script setup lang="ts">
import { Card, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
</script>

<template>
  <Card class="group hover:border-primary/40 transition-all duration-300 animate-pulse" role="status"
    aria-label="Cargando party" aria-live="polite">
    <CardHeader class="relative space-y-3 sm:space-y-4 p-4 sm:p-6">
      <div class="flex items-start gap-2 sm:gap-3">
        <Skeleton class="h-10 w-10 sm:h-12 sm:w-12 rounded-full shrink-0" />
        <div class="flex-1 min-w-0 space-y-2">
          <div class="flex items-center gap-2">
            <Skeleton class="h-4 w-32" />
            <Skeleton class="h-3.5 w-3.5 rounded" />
          </div>
          <Skeleton class="h-3 w-24" />
          <Skeleton class="h-3 w-full" />
          <Skeleton class="h-3 w-3/4" />
        </div>
      </div>

      <div class="flex items-center gap-2 p-2 sm:p-2.5 bg-muted/60 rounded-lg">
        <Skeleton class="flex-1 h-8 rounded-md" />
        <Skeleton class="h-9 w-9 rounded" />
      </div>

      <div class="flex items-center justify-between gap-2 pt-2 sm:pt-3 border-t border-border/50">
        <div class="flex -space-x-2 flex-1 min-w-0">
          <Skeleton v-for="i in 3" :key="i" class="h-7 w-7 sm:h-8 sm:w-8 rounded-full border-2 border-background"
            :style="{ animationDelay: `${i * 100}ms` }" />
        </div>
        <div class="flex gap-1">
          <Skeleton class="h-8 w-16 rounded" />
          <Skeleton class="h-9 w-9 rounded" />
          <Skeleton class="h-9 w-9 rounded" />
        </div>
      </div>
    </CardHeader>
  </Card>
</template>

