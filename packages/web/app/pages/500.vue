<script setup lang="ts">
import { AlertTriangle, Home, RefreshCw, ArrowLeft, Settings } from 'lucide-vue-next'

const SettingsIcon = Settings
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

definePageMeta({
  layout: false
})

const router = useRouter()

function goHome() {
  router.push('/')
}

function goBack() {
  router.back()
}

function retry() {
  window.location.reload()
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 relative">
    <div class="fixed inset-0 -z-10">
      <div class="absolute inset-0 bg-linear-to-br from-background via-background to-background/95" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-destructive/10 via-transparent to-transparent" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-destructive/5 via-transparent to-transparent" />
      
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-destructive/5 rounded-full blur-3xl animate-pulse" style="animation-duration: 8s" />
      <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-destructive/5 rounded-full blur-3xl animate-pulse" style="animation-duration: 10s; animation-delay: 2s" />
    </div>

    <Card class="w-full max-w-2xl border-destructive/20 shadow-2xl glass relative overflow-hidden">
      <div class="absolute inset-0 bg-linear-to-br from-destructive/5 via-transparent to-destructive/5 opacity-50" />
      <div class="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-destructive via-primary to-accent" />
      
      <CardHeader class="text-center space-y-4 relative z-10">
        <div class="relative mx-auto inline-flex items-center justify-center">
          <div class="absolute -inset-8 bg-destructive/20 blur-3xl rounded-full animate-pulse" style="animation-duration: 3s" />
          <div class="absolute -inset-4 bg-primary/10 blur-2xl rounded-full" />
          <div class="relative w-32 h-32 rounded-full bg-linear-to-br from-destructive/20 via-destructive/10 to-destructive/5 flex items-center justify-center border border-destructive/30 backdrop-blur-sm animate-[float_3s_ease-in-out_infinite]">
            <SettingsIcon class="h-16 w-16 text-destructive" />
          </div>
        </div>
        <div>
          <CardTitle class="text-6xl font-logo mb-2 text-gradient">
            500
          </CardTitle>
          <CardDescription class="text-2xl text-muted-foreground">
            Error del servidor
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent class="space-y-6 relative z-10">
        <p class="text-center text-muted-foreground text-lg">
          Algo salió mal en nuestro servidor. Estamos trabajando para solucionarlo.
        </p>

        <div class="p-4 rounded-lg bg-muted/50 border border-destructive/20 backdrop-blur-sm relative overflow-hidden">
          <div class="absolute inset-0 bg-destructive/5 opacity-50" />
          <div class="relative flex items-start gap-3">
            <div class="p-1.5 rounded-full bg-destructive/10 border border-destructive/20 shrink-0">
              <AlertTriangle class="h-4 w-4 text-destructive" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium mb-2 text-destructive">¿Qué ha pasado?</p>
              <p class="text-sm text-muted-foreground">
                Hemos detectado un error en nuestro servidor. Esto puede ser temporal. 
                Por favor, intenta recargar la página en unos momentos.
              </p>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <Button @click="goBack" variant="outline" class="flex-1 sm:flex-none hover:bg-muted/50 transition-all duration-300">
            <ArrowLeft class="h-4 w-4 mr-2" />
            Volver
          </Button>
          <Button @click="retry" variant="outline" class="flex-1 sm:flex-none hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all duration-300">
            <RefreshCw class="h-4 w-4 mr-2" />
            Reintentar
          </Button>
          <Button @click="goHome" class="flex-1 sm:flex-none glow-primary hover:glow-primary hover:scale-105 transition-all duration-300">
            <Home class="h-4 w-4 mr-2" />
            Ir al inicio
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>

