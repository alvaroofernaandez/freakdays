<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, X } from 'lucide-vue-next'

interface Props {
  open: boolean
  code: string
  isSubmitting: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  'update:code': [value: string]
  submit: []
}>()

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  const value = target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
  emit('update:code', value)
}
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
          aria-labelledby="join-party-title"
        >
          <Card class="w-full max-w-md shadow-xl border-2 my-auto" @click.stop>
            <CardHeader class="flex flex-row items-center justify-between pb-3 sm:pb-4 p-4 sm:p-6">
              <CardTitle id="join-party-title" class="text-lg sm:text-xl">Unirse a Party</CardTitle>
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
                <Label for="invite-code">Código de Invitación</Label>
                <Input
                  id="invite-code"
                  :model-value="code"
                  @input="handleInput"
                  placeholder="ABC123"
                  class="w-full font-mono uppercase text-center text-lg tracking-widest"
                  maxlength="6"
                  :disabled="isSubmitting"
                  autofocus
                  aria-required="true"
                  aria-invalid="code.length > 0 && code.length !== 6"
                  aria-describedby="code-helper code-status"
                  @keydown.enter.prevent="code.length === 6 && !isSubmitting && emit('submit')"
                />
                <div class="space-y-1">
                  <p id="code-helper" class="text-xs text-muted-foreground text-center">
                    Introduce el código de 6 caracteres que te compartieron
                  </p>
                  <p id="code-status" v-if="code.length > 0 && code.length !== 6"
                    class="text-xs text-destructive text-center" role="alert">
                    El código debe tener exactamente 6 caracteres
                  </p>
                  <p v-else-if="code.length === 6" class="text-xs text-exp-easy text-center" role="status">
                    ✓ Código válido
                  </p>
                </div>
              </div>
              <Button
                class="w-full min-h-[44px]"
                @click="emit('submit')"
                :disabled="code.length !== 6 || isSubmitting"
                aria-label="Unirse a la party con código {{ code }}"
              >
                <UserPlus v-if="!isSubmitting" class="h-4 w-4 mr-2" aria-hidden="true" />
                <span v-else class="animate-spin mr-2 inline-block" role="status" aria-label="Uniéndose a party">⏳</span>
                {{ isSubmitting ? 'Uniéndose...' : 'Unirse' }}
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

