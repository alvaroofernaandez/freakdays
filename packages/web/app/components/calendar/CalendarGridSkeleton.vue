<script setup lang="ts">
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
</script>

<template>
  <div class="space-y-1.5 flex-1 flex flex-col min-h-0">
    <div class="flex items-center justify-between gap-2 px-2 sm:px-3 py-1.5 shrink-0">
      <div class="flex items-center gap-1.5 sm:gap-2 flex-1">
        <Skeleton class="h-7 w-7 sm:h-8 sm:w-8 rounded-none" />
        <Skeleton class="h-3 w-32 sm:h-3 sm:w-40 flex-1 rounded-none" />
        <Skeleton class="h-7 w-7 sm:h-8 sm:w-8 rounded-none" />
      </div>
      <Skeleton class="h-7 sm:h-8 w-16 sm:w-20 rounded-none" />
    </div>

    <div class="grid grid-cols-7 gap-1 sm:gap-2 shrink-0">
      <Skeleton v-for="i in 7" :key="i" class="h-5 sm:h-6 rounded-none" />
    </div>

    <div class="grid grid-cols-7 gap-1 sm:gap-2 flex-1 min-h-0">
      <Card
        v-for="i in 42"
        :key="i"
        class="h-[calc((100vh-200px)/6)] sm:h-[calc((100vh-220px)/6)] md:h-[calc((100vh-240px)/6)] max-h-[140px] sm:max-h-[160px] md:max-h-[180px] rounded-none border-2 border-accent/10"
      >
        <div class="p-1.5 sm:p-2 h-full flex flex-col">
          <Skeleton class="h-3 w-5 mb-1 rounded-none" />
          <div class="flex-1 space-y-1">
            <Skeleton v-for="j in 2" :key="j" class="h-6 w-full rounded-none" />
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>
