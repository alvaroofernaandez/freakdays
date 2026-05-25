<script setup lang="ts">
import { Card, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
</script>

<template>
  <Card
    class="relative rounded-none border-2 border-secondary/15 bg-card/40"
    role="status"
    aria-label="Cargando party"
    aria-live="polite"
  >
    <!-- HUD corner brackets -->
    <span
      class="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-secondary/25"
      aria-hidden="true"
    />
    <span
      class="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-secondary/25"
      aria-hidden="true"
    />
    <span
      class="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-secondary/25"
      aria-hidden="true"
    />
    <span
      class="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-secondary/25"
      aria-hidden="true"
    />

    <CardHeader class="relative space-y-3 sm:space-y-4 p-4 sm:p-6">
      <div class="flex items-start gap-2 sm:gap-3">
        <Skeleton class="h-10 w-10 sm:h-12 sm:w-12 rounded-none shrink-0" />
        <div class="flex-1 min-w-0 space-y-2">
          <div class="flex items-center gap-2">
            <Skeleton class="h-4 w-32 rounded-none" />
            <Skeleton class="h-3.5 w-3.5 rounded-none" />
          </div>
          <Skeleton class="h-2 w-24 rounded-none" />
          <Skeleton class="h-2 w-full rounded-none" />
          <Skeleton class="h-2 w-3/4 rounded-none" />
        </div>
      </div>

      <div class="flex items-center gap-2 p-2 sm:p-2.5 bg-muted/40 border border-secondary/10">
        <Skeleton class="flex-1 h-8 rounded-none" />
        <Skeleton class="h-9 w-9 rounded-none" />
      </div>

      <div class="flex items-center justify-between gap-2 pt-2 sm:pt-3 border-t border-border/40">
        <div class="flex -space-x-2 flex-1 min-w-0">
          <Skeleton
            v-for="i in 3"
            :key="i"
            class="h-7 w-7 sm:h-8 sm:w-8 rounded-none border-2 border-background"
            :style="{ animationDelay: `${i * 100}ms` }"
          />
        </div>
        <div class="flex gap-1">
          <Skeleton class="h-8 w-16 rounded-none" />
          <Skeleton class="h-9 w-9 rounded-none" />
          <Skeleton class="h-9 w-9 rounded-none" />
        </div>
      </div>
    </CardHeader>
  </Card>
</template>
