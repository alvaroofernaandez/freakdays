<script setup lang="ts">
import { DatePicker } from '@/components/ui/date-picker'
import { Loader2, X } from 'lucide-vue-next'
import type { QuestDifficulty } from '~~/domain/types'
import { DIFFICULTY_EXP } from '~~/domain/types'

interface QuestForm {
  title: string
  description: string
  difficulty: QuestDifficulty
  due_date: string
  due_time: string
  reminder_minutes_before: number
}

const props = defineProps<{
  open: boolean
  submitting: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [form: QuestForm]
}>()

const form = ref<QuestForm>({
  title: '',
  description: '',
  difficulty: 'easy',
  due_date: '',
  due_time: '',
  reminder_minutes_before: 15,
})

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    form.value = {
      title: '',
      description: '',
      difficulty: 'easy',
      due_date: '',
      due_time: '',
      reminder_minutes_before: 15,
    }
  }
})

function handleSubmit() {
  if (!form.value.title.trim() || props.submitting) return
  emit('submit', { ...form.value })
}
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="open"
          class="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-4 bg-background/95 backdrop-blur-sm overflow-y-auto"
          style="pointer-events: auto;" @click.self="emit('close')" @keydown.esc="emit('close')">
          <Card class="w-full max-w-md my-auto shadow-xl border-2" @click.stop>
            <CardHeader class="flex flex-row items-center justify-between pb-3 sm:pb-4 border-b">
              <CardTitle class="text-lg sm:text-xl">Nueva Quest</CardTitle>
              <Button variant="ghost" size="icon"
                class="h-8 w-8 sm:h-9 sm:w-9 hover:bg-muted hover:text-foreground cursor-pointer"
                @click="emit('close')">
                <X class="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent class="space-y-4 pt-4 sm:pt-6">
              <div class="space-y-2">
                <Label for="title" class="text-sm font-medium">Título</Label>
                <Input id="title" v-model="form.title" placeholder="Ej: Meditar 10 minutos"
                  class="w-full h-11 text-base" :disabled="submitting" @keyup.enter="handleSubmit" autofocus />
              </div>
              <div class="space-y-2">
                <Label for="description" class="text-sm font-medium">Descripción (opcional)</Label>
                <Input id="description" v-model="form.description" placeholder="Detalles de la misión..."
                  class="w-full h-11 text-base" :disabled="submitting" />
              </div>
              <div class="space-y-2">
                <Label class="text-sm font-medium">Dificultad</Label>
                <div class="grid grid-cols-4 gap-2">
                  <Button v-for="(exp, diff) in DIFFICULTY_EXP" :key="diff"
                    :variant="form.difficulty === diff ? 'default' : 'outline'" size="sm" class="text-xs"
                    :disabled="submitting" @click="form.difficulty = diff as QuestDifficulty">
                    {{ diff }}
                  </Button>
                </div>
              </div>
              <div class="space-y-2">
                <Label for="due_date" class="text-sm font-medium">Fecha límite (opcional)</Label>
                <DatePicker id="due_date" v-model="form.due_date" placeholder="Selecciona una fecha"
                  class="w-full h-11 text-base" :disabled="submitting" />
              </div>
              <div v-if="form.due_date" class="space-y-2">
                <Label for="due_time" class="text-sm font-medium">Hora límite (opcional)</Label>
                <Input id="due_time" v-model="form.due_time" type="time" class="w-full h-11 text-base"
                  :disabled="submitting" />
              </div>
              <div v-if="form.due_date" class="space-y-2">
                <Label for="reminder" class="text-sm font-medium">Recordatorio (minutos antes)</Label>
                <Input id="reminder" v-model.number="form.reminder_minutes_before" type="number" min="0"
                  class="w-full h-11 text-base" :disabled="submitting" />
              </div>
              <Button size="lg" class="w-full h-12 text-base font-semibold mt-2"
                :disabled="!form.title.trim() || submitting" @click="handleSubmit">
                <Loader2 v-if="submitting" class="animate-spin h-5 w-5 mr-2" />
                Crear Quest
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
