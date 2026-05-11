<script setup lang="ts">
import { AlertTriangle, Info, XCircle, AlertCircle } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export type ErrorSeverity = 'error' | 'warning' | 'info'

interface Props {
  title?: string
  message: string
  severity?: ErrorSeverity
  details?: string
  showDetails?: boolean
  actionLabel?: string
  onAction?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  severity: 'error',
  showDetails: false
})

const showDetailsState = ref(props.showDetails)

const severityConfig = computed(() => {
  const configs: Record<ErrorSeverity, { 
    icon: any
    color: string
    bgColor: string
    borderColor: string
    title: string
  }> = {
    error: {
      icon: XCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/20',
      title: 'Error'
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-exp-medium',
      bgColor: 'bg-exp-medium/10',
      borderColor: 'border-exp-medium/20',
      title: 'Advertencia'
    },
    info: {
      icon: Info,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
      title: 'Información'
    }
  }
  
  return configs[props.severity]
})

const displayTitle = computed(() => props.title || severityConfig.value.title)
</script>

<template>
  <Card :class="['border relative overflow-hidden glass', severityConfig.borderColor]">
    <div :class="['absolute inset-0 opacity-30', severityConfig.bgColor]" />
    <div :class="['absolute top-0 left-0 w-full h-0.5', severity === 'error' ? 'bg-linear-to-r from-destructive via-primary to-accent' : severity === 'warning' ? 'bg-linear-to-r from-exp-medium via-accent to-primary' : 'bg-linear-to-r from-primary via-accent to-secondary']" />
    
    <CardHeader class="relative z-10">
      <div class="flex items-start gap-3">
        <div class="relative">
          <div :class="['absolute -inset-2 blur-xl opacity-50 animate-pulse', severityConfig.bgColor]" style="animation-duration: 2s" />
          <div :class="['relative p-2.5 rounded-full border backdrop-blur-sm', severityConfig.bgColor, severityConfig.borderColor]">
            <component :is="severityConfig.icon" :class="['h-5 w-5', severityConfig.color]" />
          </div>
        </div>
        <div class="flex-1">
          <CardTitle :class="[severityConfig.color, 'font-semibold']">
            {{ displayTitle }}
          </CardTitle>
          <CardDescription class="mt-1.5">
            {{ message }}
          </CardDescription>
        </div>
      </div>
    </CardHeader>
    
    <CardContent v-if="details || $slots.default" class="space-y-4 relative z-10">
      <div v-if="details && showDetailsState" class="p-3 rounded-lg bg-muted/50 border backdrop-blur-sm relative overflow-hidden" :class="severityConfig.borderColor">
        <div :class="['absolute inset-0 opacity-20', severityConfig.bgColor]" />
        <div class="relative">
          <p class="text-xs font-medium mb-1.5" :class="severityConfig.color">Detalles técnicos:</p>
          <p class="text-xs text-muted-foreground font-mono break-all whitespace-pre-wrap">
            {{ details }}
          </p>
        </div>
      </div>
      
      <div v-if="details" class="flex items-center justify-between">
        <Button
          v-if="details"
          @click="showDetailsState = !showDetailsState"
          variant="ghost"
          size="sm"
          class="text-xs hover:bg-muted/50 transition-colors"
        >
          {{ showDetailsState ? 'Ocultar' : 'Mostrar' }} detalles
        </Button>
      </div>
      
      <slot />
      
      <Button
        v-if="onAction && actionLabel"
        @click="onAction"
        :variant="severity === 'error' ? 'destructive' : 'outline'"
        :class="[
          'w-full transition-all duration-300',
          severity === 'error' ? 'glow-primary hover:glow-primary hover:scale-[1.02]' : 'hover:bg-muted/50 hover:scale-[1.02]'
        ]"
      >
        {{ actionLabel }}
      </Button>
    </CardContent>
  </Card>
</template>

