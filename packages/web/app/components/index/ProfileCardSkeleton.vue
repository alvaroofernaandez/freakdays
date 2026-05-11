<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
</script>

<template>
  <Card class="relative overflow-hidden border-primary/20 bg-linear-to-br from-primary/10 via-background to-exp-legendary/10">
    <div class="absolute top-0 right-0 w-64 h-64 bg-exp-legendary/10 rounded-full blur-3xl" />
    <div class="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
    <CardContent class="relative p-6">
      <div class="flex items-center gap-6">
        <div class="relative flex-shrink-0">
          <Skeleton class="w-20 h-20 rounded-full" />
        </div>
        <div class="flex-1 space-y-3 min-w-0">
          <div class="flex items-center justify-between gap-4">
            <Skeleton class="h-5 w-32" />
            <Skeleton class="h-4 w-24" />
          </div>
          <Skeleton class="h-3 w-full rounded-full" />
          <div class="flex items-center gap-6">
            <Skeleton class="h-4 w-28" />
            <Skeleton class="h-4 w-24" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

