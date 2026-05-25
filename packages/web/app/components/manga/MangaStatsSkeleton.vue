<script setup lang="ts">
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
    <Card v-for="i in 6" :key="i" class="rounded-none border-2 p-3">
      <Skeleton class="h-6 w-8 mb-1.5" />
      <Skeleton class="h-3 w-12 mb-2" />
      <div class="flex gap-0.5">
        <Skeleton v-for="j in 10" :key="j" class="h-1 flex-1" />
      </div>
    </Card>
  </div>
</template>
