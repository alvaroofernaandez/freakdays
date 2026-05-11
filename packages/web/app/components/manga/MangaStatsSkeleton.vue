<script setup lang="ts">
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
    <Card v-for="i in 6" :key="i" class="text-center py-3">
      <Skeleton class="h-8 w-12 mx-auto mb-2" />
      <Skeleton class="h-3 w-16 mx-auto" />
    </Card>
  </div>
</template>

