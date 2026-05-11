<script setup lang="ts">
import { AlertTriangle, X, Power } from 'lucide-vue-next'
import type { ModuleId } from '~~/domain/types'

interface Props {
  open: boolean
  moduleName: string | null
  saving: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-sm">
    <Card class="w-full max-w-md shadow-xl border-2">
      <CardHeader class="flex flex-row items-center justify-between pb-3 sm:pb-4 border-b">
        <CardTitle class="text-lg sm:text-xl flex items-center gap-2">
          <AlertTriangle class="h-5 w-5 text-exp-hard" />
          Confirmar desactivación
        </CardTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          class="h-8 w-8 sm:h-9 sm:w-9 hover:bg-muted hover:text-foreground cursor-pointer" 
          @click="emit('cancel')"
        >
          <X class="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent class="pt-4 sm:pt-6 space-y-4">
        <p class="text-sm sm:text-base text-muted-foreground">
          ¿Estás seguro que quieres desactivar el módulo <span class="font-semibold text-foreground">{{ moduleName }}</span>?
        </p>
        <p class="text-xs sm:text-sm text-muted-foreground/70">
          Podrás reactivarlo en cualquier momento desde esta página.
        </p>
      </CardContent>
      <CardFooter class="flex gap-2 pt-4 border-t">
        <Button 
          variant="outline" 
          class="flex-1"
          @click="emit('cancel')"
          :disabled="saving"
        >
          Cancelar
        </Button>
        <Button 
          variant="destructive"
          class="flex-1"
          @click="emit('confirm')"
          :disabled="saving"
        >
          <Power v-if="!saving" class="h-4 w-4 mr-2" />
          <div v-else class="animate-spin w-4 h-4 border-2 border-destructive-foreground border-t-transparent rounded-full mr-2" />
          Desactivar
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>

