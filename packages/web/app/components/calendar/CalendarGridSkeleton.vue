<script setup lang="ts">
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
</script>

<template>
  <div class="space-y-1.5 flex-1 flex flex-col min-h-0">
    <div class="flex items-center justify-between gap-2 px-2 sm:px-3 py-1.5 shrink-0">
      <div class="flex items-center gap-1.5 sm:gap-2 flex-1">
        <Skeleton class="h-7 w-7 sm:h-8 sm:w-8 rounded" />
        <Skeleton class="h-4 w-32 sm:h-5 sm:w-40 flex-1" />
        <Skeleton class="h-7 w-7 sm:h-8 sm:w-8 rounded" />
      </div>
      <Skeleton class="h-7 sm:h-8 w-16 sm:w-20 rounded" />
    </div>

    <div class="grid grid-cols-7 gap-1 sm:gap-2 shrink-0">
      <Skeleton v-for="i in 7" :key="i"
        class="h-6 sm:h-8 text-center text-xs sm:text-sm font-semibold py-1.5 sm:py-2 px-1" />
    </div>

    <div class="grid grid-cols-7 gap-1 sm:gap-2 flex-1 min-h-0">
      <Card v-for="i in 42" :key="i"
        class="h-[calc((100vh-200px)/6)] sm:h-[calc((100vh-220px)/6)] md:h-[calc((100vh-240px)/6)] max-h-[140px] sm:max-h-[160px] md:max-h-[180px]">
        <div class="p-1.5 sm:p-2 h-full flex flex-col">
          <Skeleton class="h-4 w-6 mb-1" />
          <div class="flex-1 space-y-1">
            <Skeleton v-for="j in 2" :key="j" class="h-8 w-full rounded" />
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>
