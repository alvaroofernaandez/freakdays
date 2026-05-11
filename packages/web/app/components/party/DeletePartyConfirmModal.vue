<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2 } from 'lucide-vue-next'
import type { Party, PartyMember } from '@/composables/useParties'

type ReadonlyParty = Readonly<Omit<Party, 'members'>> & {
  readonly members: readonly Readonly<PartyMember>[]
}

interface Props {
  open: boolean
  party: ReadonlyParty | Party | null
  isSubmitting: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  confirm: [partyId: string]
}>()
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="open && party"
          class="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 bg-background/95 backdrop-blur-sm overflow-y-auto"
          style="pointer-events: auto;"
          @click.self="emit('close')"
          @keydown.esc="emit('close')"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
        >
          <Card class="w-full max-w-md shadow-xl border-2 border-destructive/20 my-auto" @click.stop>
            <CardHeader class="p-4 sm:p-6">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-destructive/10 rounded-lg">
                  <Trash2 class="h-5 w-5 text-destructive" aria-hidden="true" />
                </div>
                <div class="flex-1">
                  <CardTitle id="delete-confirm-title" class="text-destructive text-lg sm:text-xl">
                    Eliminar Party
                  </CardTitle>
                  <CardDescription class="text-sm sm:text-base mt-1">
                    Esta acción no se puede deshacer
                  </CardDescription>
                </div>
              </div>
              <div class="mt-4 p-3 bg-destructive/5 border border-destructive/20 rounded-md">
                <p class="text-sm font-medium">¿Estás seguro de que quieres eliminar "{{ party.name }}"?</p>
                <p class="text-xs text-muted-foreground mt-1">
                  Todos los miembros serán notificados y perderán acceso a esta party
                </p>
              </div>
            </CardHeader>
            <CardContent class="flex flex-col sm:flex-row gap-2 p-4 sm:p-6 pt-0">
              <Button variant="outline" class="flex-1 min-h-[44px] order-2 sm:order-1" @click="emit('close')"
                :disabled="isSubmitting">
                Cancelar
              </Button>
              <Button variant="destructive" class="flex-1 min-h-[44px] order-1 sm:order-2"
                @click="emit('confirm', party.id)" :disabled="isSubmitting"
                aria-label="Confirmar eliminación de party {{ party.name }}">
                <Trash2 v-if="!isSubmitting" class="h-4 w-4 mr-2" aria-hidden="true" />
                <span v-else class="animate-spin mr-2 inline-block" role="status" aria-label="Eliminando party">⏳</span>
                {{ isSubmitting ? 'Eliminando...' : 'Eliminar Party' }}
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

