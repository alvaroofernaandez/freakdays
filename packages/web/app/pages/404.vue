<script setup lang="ts">
import { Home, Search, ArrowLeft } from 'lucide-vue-next'

const SearchIcon = Search
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
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 relative">
    <div class="fixed inset-0 -z-10">
      <div class="absolute inset-0 bg-linear-to-br from-background via-background to-background/95" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />
      
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style="animation-duration: 8s" />
      <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style="animation-duration: 10s; animation-delay: 2s" />
    </div>

    <Card class="w-full max-w-2xl border-primary/20 shadow-2xl glass relative overflow-hidden">
      <div class="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5 opacity-50" />
      <div class="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary via-accent to-secondary" />
      
      <CardHeader class="text-center space-y-4 relative z-10">
        <div class="relative mx-auto inline-flex items-center justify-center">
          <div class="absolute -inset-8 bg-primary/20 blur-3xl rounded-full animate-pulse" style="animation-duration: 3s" />
          <div class="absolute -inset-4 bg-accent/10 blur-2xl rounded-full" />
          <div class="relative w-32 h-32 rounded-full bg-linear-to-br from-primary/20 via-accent/10 to-secondary/10 flex items-center justify-center border border-primary/30 backdrop-blur-sm animate-[float_3s_ease-in-out_infinite]">
            <SearchIcon class="h-16 w-16 text-primary" />
          </div>
        </div>
        <div>
          <CardTitle class="text-6xl font-logo mb-2 text-gradient">
            404
          </CardTitle>
          <CardDescription class="text-2xl text-muted-foreground">
            Página no encontrada
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent class="space-y-6 relative z-10">
        <p class="text-center text-muted-foreground text-lg">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>

        <div class="p-4 rounded-lg bg-muted/50 border border-primary/20 backdrop-blur-sm relative overflow-hidden">
          <div class="absolute inset-0 bg-primary/5 opacity-50" />
          <div class="relative flex items-start gap-3">
            <div class="p-1.5 rounded-full bg-primary/10 border border-primary/20 shrink-0">
              <Search class="h-4 w-4 text-primary" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium mb-2 text-primary">¿Qué puedes hacer?</p>
              <ul class="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
                <li>Verifica que la URL sea correcta</li>
                <li>Navega desde el menú principal</li>
                <li>Usa la búsqueda para encontrar lo que necesitas</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <Button @click="goBack" variant="outline" class="flex-1 sm:flex-none hover:bg-muted/50 transition-all duration-300">
            <ArrowLeft class="h-4 w-4 mr-2" />
            Volver
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

