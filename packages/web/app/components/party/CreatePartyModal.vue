<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, X } from 'lucide-vue-next'

interface Props {
  open: boolean
  name: string
  description: string
  isSubmitting: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  'update:name': [value: string]
  'update:description': [value: string]
  submit: []
}>()
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="open"
          class="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 bg-background/95 backdrop-blur-sm overflow-y-auto"
          style="pointer-events: auto;"
          @click.self="emit('close')"
          @keydown.esc="emit('close')"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-party-title"
        >
          <Card class="w-full max-w-md shadow-xl border-2 my-auto" @click.stop>
            <CardHeader class="flex flex-row items-center justify-between pb-3 sm:pb-4 p-4 sm:p-6">
              <CardTitle id="create-party-title" class="text-lg sm:text-xl">Crear Party</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                class="h-9 w-9 sm:h-8 sm:w-8 touch-manipulation"
                @click="emit('close')"
                aria-label="Cerrar"
              >
                <X class="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent class="space-y-4 p-4 sm:p-6 pt-0">
              <div class="space-y-2">
                <Label for="party-name">Nombre de la Party *</Label>
                <Input
                  id="party-name"
                  :model-value="name"
                  @update:model-value="emit('update:name', $event)"
                  placeholder="Ej: Nakamas del Anime"
                  class="w-full"
                  maxlength="50"
                  :disabled="isSubmitting"
                  aria-required="true"
                  aria-invalid="false"
                  aria-describedby="name-helper name-count"
                  autofocus
                  @keydown.enter.prevent="!isSubmitting && name.trim() && emit('submit')"
                />
                <div class="flex items-center justify-between">
                  <p id="name-helper" class="text-xs text-muted-foreground">
                    Elige un nombre único y descriptivo para tu party
                  </p>
                  <p id="name-count" class="text-xs text-muted-foreground" :class="{ 'text-primary': name.length > 40 }">
                    {{ name.length }}/50
                  </p>
                </div>
              </div>
              <div class="space-y-2">
                <Label for="party-description">Descripción (opcional)</Label>
                <Input
                  id="party-description"
                  :model-value="description"
                  @update:model-value="emit('update:description', $event)"
                  placeholder="Describe el propósito de esta party..."
                  class="w-full"
                  maxlength="200"
                  :disabled="isSubmitting"
                  aria-describedby="description-helper description-count"
                  @keydown.enter.prevent="!isSubmitting && name.trim() && emit('submit')"
                />
                <div class="flex items-center justify-between">
                  <p id="description-helper" class="text-xs text-muted-foreground">
                    Ayuda a otros a entender el propósito de esta party
                  </p>
                  <p id="description-count" class="text-xs text-muted-foreground"
                    :class="{ 'text-primary': description.length > 180 }">
                    {{ description.length }}/200
                  </p>
                </div>
              </div>
              <Button class="w-full min-h-[44px]" @click="emit('submit')" :disabled="!name.trim() || isSubmitting"
                aria-label="Crear party con nombre {{ name }}">
                <Plus v-if="!isSubmitting" class="h-4 w-4 mr-2" aria-hidden="true" />
                <span v-else class="animate-spin mr-2 inline-block" role="status" aria-label="Creando party">⏳</span>
                {{ isSubmitting ? 'Creando...' : 'Crear Party' }}
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

