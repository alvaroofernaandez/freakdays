<script setup lang="ts">
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
</script>

<template>
  <div class="grid grid-cols-3 gap-2 sm:gap-3">
    <Card v-for="i in 3" :key="i" class="rounded-none border-2 py-4 sm:py-5 px-4">
      <Skeleton class="h-8 w-12 mb-2" />
      <Skeleton class="h-3 w-16 mb-3" />
      <div class="flex gap-1">
        <Skeleton v-for="j in 10" :key="j" class="h-1.5 flex-1" />
      </div>
    </Card>
  </div>
</template>
