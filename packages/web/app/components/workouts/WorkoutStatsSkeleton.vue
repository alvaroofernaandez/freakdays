<script setup lang="ts">
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
</script>

<template>
  <div class="grid grid-cols-3 gap-2 sm:gap-3">
    <Card v-for="i in 3" :key="i" class="text-center py-3 sm:py-4">
      <Skeleton class="h-8 w-12 mx-auto mb-2" />
      <Skeleton class="h-3 w-16 mx-auto" />
    </Card>
  </div>
</template>

