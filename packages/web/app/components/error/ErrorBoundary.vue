<script setup lang="ts">
import { ref, onErrorCaptured, type ComponentPublicInstance } from 'vue'
import { AlertTriangle, RefreshCw, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  fallback?: string
  onError?: (error: Error, instance: ComponentPublicInstance | null, info: string) => void
}

const props = withDefaults(defineProps<Props>(), {
  fallback: 'Algo salió mal. Por favor, recarga la página.'
})

const error = ref<Error | null>(null)
const errorInfo = ref<string>('')

onErrorCaptured((err: Error, instance: ComponentPublicInstance | null, info: string) => {
  error.value = err
  errorInfo.value = info
  
  if (props.onError) {
    props.onError(err, instance, info)
  }
  
  return false
})

function handleReset() {
  error.value = null
  errorInfo.value = ''
}
</script>

<template>
  <div v-if="error" class="p-4">
    <Card class="border-destructive/20 glass relative overflow-hidden">
      <div class="absolute inset-0 bg-destructive/5 opacity-50" />
      <div class="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-destructive via-primary to-accent" />
      
      <CardHeader class="relative z-10">
        <div class="flex items-center gap-3">
          <div class="relative">
            <div class="absolute -inset-2 bg-destructive/20 blur-xl rounded-full animate-pulse opacity-50" style="animation-duration: 2s" />
            <div class="relative p-2.5 rounded-full bg-destructive/10 border border-destructive/20 backdrop-blur-sm">
              <AlertTriangle class="h-5 w-5 text-destructive" />
            </div>
          </div>
          <div class="flex-1">
            <CardTitle class="text-destructive font-semibold">Error en el componente</CardTitle>
            <CardDescription class="mt-1">Se ha producido un error inesperado</CardDescription>
          </div>
          <Button @click="handleReset" variant="ghost" size="icon" class="hover:bg-muted/50 transition-colors">
            <X class="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent class="space-y-4 relative z-10">
        <p class="text-sm text-muted-foreground">
          {{ props.fallback }}
        </p>
        
        <div v-if="error.message" class="p-3 rounded-lg bg-muted/50 border border-destructive/20 backdrop-blur-sm relative overflow-hidden">
          <div class="absolute inset-0 bg-destructive/5 opacity-50" />
          <div class="relative">
            <p class="text-xs font-medium text-destructive mb-1">Mensaje de error:</p>
            <p class="text-xs text-muted-foreground font-mono break-all">
              {{ error.message }}
            </p>
          </div>
        </div>
        
        <div v-if="errorInfo" class="p-3 rounded-lg bg-muted/50 border border-destructive/20 backdrop-blur-sm relative overflow-hidden">
          <div class="absolute inset-0 bg-destructive/5 opacity-50" />
          <div class="relative">
            <p class="text-xs font-medium text-destructive mb-1">Información:</p>
            <p class="text-xs text-muted-foreground font-mono break-all">
              {{ errorInfo }}
            </p>
          </div>
        </div>
        
        <Button @click="handleReset" variant="outline" class="w-full hover:bg-muted/50 hover:scale-[1.02] transition-all duration-300">
          <RefreshCw class="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </CardContent>
    </Card>
  </div>
  <slot v-else />
</template>

