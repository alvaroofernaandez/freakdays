<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
</script>

<template>
  <Card>
    <CardHeader class="flex flex-row items-center gap-3 py-3 sm:py-4 px-3 sm:px-4">
      <Skeleton class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg shrink-0" />
      
      <div class="flex-1 min-w-0 space-y-2">
        <Skeleton class="h-4 sm:h-5 w-3/4" />
        <Skeleton class="h-3 sm:h-4 w-1/2" />
      </div>
      
      <div class="flex items-center gap-2 shrink-0">
        <Skeleton class="h-6 w-16" />
        <Skeleton class="h-8 w-8 rounded" />
      </div>
    </CardHeader>
  </Card>
</template>

