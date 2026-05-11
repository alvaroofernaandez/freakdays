<script setup lang="ts">
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
</script>

<template>
  <Card>
    <CardHeader class="py-3 sm:py-4 px-3 sm:px-4">
      <div class="flex items-start gap-3">
        <Skeleton class="w-6 h-6 sm:w-7 sm:h-7 rounded-full shrink-0 mt-1" />
        
        <div class="flex-1 min-w-0 space-y-2">
          <div class="flex items-center gap-2 flex-wrap">
            <Skeleton class="h-4 sm:h-5 w-2/3" />
            <Skeleton class="h-5 w-16 rounded-full" />
          </div>
          
          <Skeleton class="h-3 w-full" />
          <Skeleton class="h-3 w-3/4" />
          
          <div class="flex items-center gap-3 mt-2">
            <Skeleton class="h-3 w-20" />
            <Skeleton class="h-3 w-16" />
          </div>
        </div>
        
        <Skeleton class="h-8 w-8 rounded shrink-0" />
      </div>
    </CardHeader>
  </Card>
</template>

