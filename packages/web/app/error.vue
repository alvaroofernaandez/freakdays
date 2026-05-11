<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, ArrowLeft, Clock, Home, Lock, RefreshCw, Search, Settings, User, Wrench, X } from 'lucide-vue-next'

interface ErrorProps {
  error: {
    statusCode?: number
    statusMessage?: string
    message?: string
    stack?: string
  }
}

const props = defineProps<ErrorProps>()

const error = computed(() => props.error || {})
const route = useRoute()
const router = useRouter()

const errorInfo = computed(() => {
  const statusCode = error.value?.statusCode || 500
  const statusMessage = error.value?.statusMessage || 'Error desconocido'

  const errorMessages: Record<number, { title: string; description: string; icon: any }> = {
    404: {
      title: 'Página no encontrada',
      description: 'Lo sentimos, la página que buscas no existe o ha sido movida.',
      icon: Search
    },
    500: {
      title: 'Error del servidor',
      description: 'Algo salió mal en nuestro servidor. Estamos trabajando para solucionarlo.',
      icon: Settings
    },
    403: {
      title: 'Acceso denegado',
      description: 'No tienes permisos para acceder a esta página.',
      icon: Lock
    },
    401: {
      title: 'No autorizado',
      description: 'Necesitas iniciar sesión para acceder a esta página.',
      icon: User
    },
    429: {
      title: 'Demasiadas solicitudes',
      description: 'Has realizado demasiadas solicitudes. Por favor, espera un momento.',
      icon: Clock
    },
    503: {
      title: 'Servicio no disponible',
      description: 'El servicio está temporalmente no disponible. Inténtalo más tarde.',
      icon: Wrench
    }
  }

  return errorMessages[statusCode] || {
    title: statusMessage,
    description: error.value?.message || 'Ha ocurrido un error inesperado.',
    icon: X
  }
})

function handleError() {
  clearError({ redirect: '/' })
}

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
      <div
        class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-destructive/10 via-transparent to-transparent" />
      <div
        class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,var(--tw-gradient-stops))] from-destructive/5 via-transparent to-transparent" />

      <div class="absolute top-0 left-1/4 w-96 h-96 bg-destructive/5 rounded-full blur-3xl animate-pulse"
        style="animation-duration: 8s" />
      <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-destructive/5 rounded-full blur-3xl animate-pulse"
        style="animation-duration: 10s; animation-delay: 2s" />
    </div>

    <Card class="w-full max-w-2xl border-destructive/20 shadow-2xl glass relative overflow-hidden">
      <div class="absolute inset-0 bg-linear-to-br from-destructive/5 via-transparent to-destructive/5 opacity-50" />
      <div class="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-destructive via-primary to-accent" />

      <CardHeader class="text-center space-y-4 relative z-10">
        <div class="relative mx-auto inline-flex items-center justify-center">
          <div class="absolute -inset-4 bg-destructive/20 blur-2xl rounded-full animate-pulse"
            style="animation-duration: 3s" />
          <div
            class="relative w-24 h-24 rounded-full bg-linear-to-br from-destructive/20 via-destructive/10 to-destructive/5 flex items-center justify-center border border-destructive/30 backdrop-blur-sm">
            <component :is="errorInfo.icon" class="h-12 w-12 text-destructive" />
          </div>
        </div>
        <div>
          <CardTitle class="text-4xl font-logo mb-2 text-gradient">
            {{ error?.statusCode || 'Error' }}
          </CardTitle>
          <CardDescription class="text-xl text-muted-foreground">
            {{ errorInfo.title }}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent class="space-y-6 relative z-10">
        <p class="text-center text-muted-foreground text-lg">
          {{ errorInfo.description }}
        </p>

        <div v-if="error?.message && error?.statusCode !== 404"
          class="p-4 rounded-lg bg-muted/50 border border-destructive/20 backdrop-blur-sm relative overflow-hidden">
          <div class="absolute inset-0 bg-destructive/5 opacity-50" />
          <div class="relative flex items-start gap-3">
            <div class="p-1.5 rounded-full bg-destructive/10 border border-destructive/20 shrink-0">
              <AlertTriangle class="h-4 w-4 text-destructive" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-destructive mb-1">Detalles del error:</p>
              <p class="text-sm text-muted-foreground font-mono break-all">
                {{ error.message }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <Button @click="goBack" variant="outline"
            class="flex-1 sm:flex-none hover:bg-muted/50 transition-all duration-300">
            <ArrowLeft class="h-4 w-4 mr-2" />
            Volver
          </Button>
          <Button @click="goHome" variant="outline"
            class="flex-1 sm:flex-none hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all duration-300">
            <Home class="h-4 w-4 mr-2" />
            Inicio
          </Button>
          <Button @click="handleError"
            class="flex-1 sm:flex-none glow-primary hover:glow-primary hover:scale-105 transition-all duration-300">
            <RefreshCw class="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>

        <div v-if="error?.statusCode === 404" class="text-center">
          <p class="text-sm text-muted-foreground">
            ¿Buscas algo específico? Prueba a navegar desde el menú principal.
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
@keyframes bounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}
</style>
