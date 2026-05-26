<script setup lang="ts">
import { Card, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
</script>

<template>
  <Card class="relative rounded-none border-2 border-primary/15 bg-card/40">
    <span
      class="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-primary/25"
      aria-hidden="true"
    />
    <span
      class="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-primary/25"
      aria-hidden="true"
    />
    <span
      class="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-primary/25"
      aria-hidden="true"
    />
    <span
      class="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-primary/25"
      aria-hidden="true"
    />
    <CardHeader class="flex flex-row items-center gap-3 py-3 sm:py-4 px-3 sm:px-4">
      <Skeleton class="w-10 h-10 sm:w-12 sm:h-12 rounded-none shrink-0" />
      <div class="flex-1 min-w-0 space-y-2">
        <Skeleton class="h-4 sm:h-5 w-3/4 rounded-none" />
        <Skeleton class="h-2 w-1/2 rounded-none" />
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <Skeleton class="h-5 w-16 rounded-none" />
        <Skeleton class="h-8 w-8 rounded-none" />
      </div>
    </CardHeader>
  </Card>
</template>
