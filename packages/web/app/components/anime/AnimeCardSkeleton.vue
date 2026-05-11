<script setup lang="ts">
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
</script>

<template>
  <Card>
    <CardHeader class="flex flex-row items-start gap-3 py-3 px-4">
      <Skeleton class="w-12 h-16 rounded-lg shrink-0" />
      
      <div class="flex-1 min-w-0 space-y-2">
        <Skeleton class="h-5 w-3/4" />
        <Skeleton class="h-4 w-1/2" />
        
        <div class="flex items-center gap-2 mt-2 flex-wrap">
          <Skeleton class="h-5 w-16 rounded-full" />
          <Skeleton class="h-4 w-12" />
          <Skeleton class="h-4 w-10" />
        </div>
        
        <div class="mt-2 space-y-1">
          <div class="flex items-center justify-between">
            <Skeleton class="h-3 w-20" />
            <Skeleton class="h-3 w-8" />
          </div>
          <Skeleton class="h-1.5 w-full rounded-full" />
        </div>
        
        <div class="flex items-center gap-3 mt-2">
          <Skeleton class="h-3 w-24" />
          <Skeleton class="h-3 w-20" />
        </div>
      </div>
      
      <div class="flex flex-col items-end gap-1 shrink-0">
        <Skeleton class="h-7 w-7 rounded" />
        <Skeleton class="h-7 w-7 rounded" />
        <Skeleton class="h-7 w-7 rounded" />
      </div>
    </CardHeader>
  </Card>
</template>

