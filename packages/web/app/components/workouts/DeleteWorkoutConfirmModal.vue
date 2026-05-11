<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Workout } from '@/composables/useWorkouts'
import { Trash2, Dumbbell } from 'lucide-vue-next'

interface Props {
  open: boolean
  workout: Workout | null
  isSubmitting: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  confirm: [workoutId: string]
}>()
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="open && workout"
          class="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 bg-background/95 backdrop-blur-sm overflow-y-auto"
          style="pointer-events: auto;"
          @click.self="emit('close')"
          @keydown.esc="emit('close')"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
          aria-describedby="delete-confirm-description"
        >
          <Card class="w-full max-w-md shadow-xl border-2 border-destructive/20 my-auto" @click.stop role="document">
            <CardHeader class="p-4 sm:p-6 pb-3 sm:pb-4">
              <CardTitle id="delete-confirm-title" class="text-destructive text-lg sm:text-xl flex items-center gap-2">
                <Trash2 class="h-5 w-5" aria-hidden="true" />
                Eliminar Entrenamiento
              </CardTitle>
              <CardDescription class="text-sm sm:text-base mt-2" id="delete-confirm-description">
                ¿Estás seguro de que quieres eliminar <strong>"{{ workout.name }}"</strong>? Esta acción no se puede
                deshacer.
              </CardDescription>
            </CardHeader>
            <CardContent class="flex flex-col sm:flex-row gap-2 p-4 sm:p-6 pt-0">
              <Button
                variant="outline"
                class="flex-1 min-h-[44px] touch-manipulation"
                @click="emit('close')"
                :disabled="isSubmitting"
                aria-label="Cancelar eliminación"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                class="flex-1 min-h-[44px] touch-manipulation cursor-pointer"
                @click="emit('confirm', workout.id)"
                :disabled="isSubmitting"
                :aria-label="isSubmitting ? 'Eliminando entrenamiento...' : `Confirmar eliminación de ${workout.name}`"
              >
                <Trash2 v-if="!isSubmitting" class="h-4 w-4 mr-2" aria-hidden="true" />
                <span v-else class="animate-spin mr-2" aria-hidden="true">⏳</span>
                <span>{{ isSubmitting ? 'Eliminando...' : 'Eliminar' }}</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>

