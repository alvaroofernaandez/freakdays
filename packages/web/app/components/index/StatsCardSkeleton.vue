<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
</script>

<template>
  <Card class="relative overflow-hidden">
    <div class="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
    <CardContent class="relative p-6">
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <Skeleton class="h-4 w-32" />
          <Skeleton class="h-8 w-16" />
        </div>
        <Skeleton class="w-12 h-12 rounded-full" />
      </div>
    </CardContent>
  </Card>
</template>

