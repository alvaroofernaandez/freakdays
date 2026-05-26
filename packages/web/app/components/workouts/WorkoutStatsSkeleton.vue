<script setup lang="ts">
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
</script>

<template>
  <div class="grid grid-cols-3 gap-2 sm:gap-3">
    <Card
      v-for="i in 3"
      :key="i"
      class="relative rounded-none border-2 border-primary/20 bg-card/40 overflow-hidden"
    >
      <!-- HUD targeting brackets -->
      <span
        class="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary/30"
        aria-hidden="true"
      />
      <span
        class="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary/30"
        aria-hidden="true"
      />
      <span
        class="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary/30"
        aria-hidden="true"
      />
      <span
        class="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary/30"
        aria-hidden="true"
      />
      <div class="p-5 space-y-3">
        <Skeleton class="h-2 w-16 rounded-none" />
        <Skeleton class="h-9 w-12 rounded-none" />
        <div class="flex gap-1">
          <Skeleton v-for="j in 10" :key="j" class="h-1.5 flex-1 rounded-none" />
        </div>
      </div>
    </Card>
  </div>
</template>
