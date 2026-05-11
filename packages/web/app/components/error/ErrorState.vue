<script setup lang="ts">
import { AlertCircle, RefreshCw } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  title?: string
  message: string
  actionLabel?: string
  onAction?: () => void
  variant?: 'default' | 'compact'
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Algo salió mal',
  variant: 'default'
})
</script>

<template>
  <Card v-if="variant === 'default'" class="border-destructive/20 glass relative overflow-hidden">
    <div class="absolute inset-0 bg-destructive/5 opacity-50" />
    <div class="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-destructive via-primary to-accent" />
    
    <CardHeader class="relative z-10">
      <div class="flex items-center gap-3">
        <div class="relative">
          <div class="absolute -inset-2 bg-destructive/20 blur-xl rounded-full animate-pulse opacity-50" style="animation-duration: 2s" />
          <div class="relative p-2.5 rounded-full bg-destructive/10 border border-destructive/20 backdrop-blur-sm">
            <AlertCircle class="h-5 w-5 text-destructive" />
          </div>
        </div>
        <div class="flex-1">
          <CardTitle class="text-destructive font-semibold">{{ props.title }}</CardTitle>
          <CardDescription class="mt-1">{{ props.message }}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent v-if="onAction" class="relative z-10">
      <Button @click="onAction" variant="outline" class="w-full hover:bg-muted/50 hover:scale-[1.02] transition-all duration-300">
        <RefreshCw class="h-4 w-4 mr-2" />
        {{ actionLabel || 'Reintentar' }}
      </Button>
    </CardContent>
  </Card>
  
  <div v-else class="flex flex-col items-center justify-center p-8 text-center relative">
    <div class="absolute inset-0 bg-destructive/5 rounded-lg border border-destructive/20 backdrop-blur-sm" />
    <div class="relative z-10">
      <div class="relative inline-flex items-center justify-center mb-4">
        <div class="absolute -inset-3 bg-destructive/20 blur-xl rounded-full animate-pulse opacity-50" style="animation-duration: 2s" />
        <div class="relative p-3 rounded-full bg-destructive/10 border border-destructive/20 backdrop-blur-sm">
          <AlertCircle class="h-6 w-6 text-destructive" />
        </div>
      </div>
      <h3 class="text-lg font-semibold text-destructive mb-2">{{ props.title }}</h3>
      <p class="text-sm text-muted-foreground mb-4">{{ props.message }}</p>
      <Button v-if="onAction" @click="onAction" variant="outline" size="sm" class="hover:bg-muted/50 hover:scale-105 transition-all duration-300">
        <RefreshCw class="h-4 w-4 mr-2" />
        {{ actionLabel || 'Reintentar' }}
      </Button>
    </div>
  </div>
</template>

