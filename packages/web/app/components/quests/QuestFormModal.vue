<script setup lang="ts">
import { DatePicker } from '@/components/ui/date-picker';
import { Loader2, Swords, X } from 'lucide-vue-next';
import type { QuestDifficulty } from '~~/domain/types';
import { DIFFICULTY_EXP } from '~~/domain/types';

interface QuestForm {
  title: string;
  description: string;
  difficulty: QuestDifficulty;
  due_date: string;
  due_time: string;
  reminder_minutes_before: number;
}

const props = defineProps<{
  open: boolean;
  submitting: boolean;
}>();

const emit = defineEmits<{
  close: [];
  submit: [form: QuestForm];
}>();

const form = ref<QuestForm>({
  title: '',
  description: '',
  difficulty: 'easy',
  due_date: '',
  due_time: '',
  reminder_minutes_before: 15,
});

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      form.value = {
        title: '',
        description: '',
        difficulty: 'easy',
        due_date: '',
        due_time: '',
        reminder_minutes_before: 15,
      };
    }
  },
);

function handleSubmit() {
  if (!form.value.title.trim() || props.submitting) return;
  emit('submit', { ...form.value });
}
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="open"
          class="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-4 bg-background/95 backdrop-blur-sm overflow-y-auto"
          style="pointer-events: auto"
          @click.self="emit('close')"
          @keydown.esc="emit('close')"
        >
          <Card class="w-full max-w-md my-auto shadow-xl rounded-none border-2" @click.stop>
            <CardHeader class="flex flex-row items-center justify-between pb-3 sm:pb-4 border-b">
              <CardTitle class="flex items-center gap-2 text-lg sm:text-xl">
                <Swords class="h-5 w-5 text-primary" aria-hidden="true" />
                <span>Nueva Quest</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 sm:h-9 sm:w-9 rounded-none hover:bg-muted hover:text-foreground cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Cerrar formulario"
                @click="emit('close')"
              >
                <X class="h-4 w-4" aria-hidden="true" />
              </Button>
            </CardHeader>
            <CardContent class="space-y-4 pt-4 sm:pt-6">
              <div class="space-y-2">
                <Label for="title" class="font-pixel text-[9px] text-muted-foreground uppercase">
                  <span class="text-primary">▸</span> TÍTULO
                </Label>
                <Input
                  id="title"
                  v-model="form.title"
                  placeholder="Ej: Meditar 10 minutos"
                  class="w-full h-11 text-base rounded-none border-2"
                  :disabled="submitting"
                  autofocus
                  @keyup.enter="handleSubmit"
                />
              </div>
              <div class="space-y-2">
                <Label
                  for="description"
                  class="font-pixel text-[9px] text-muted-foreground uppercase"
                >
                  <span class="text-accent">▸</span> DESCRIPCIÓN
                  <span class="text-muted-foreground/50">(OPCIONAL)</span>
                </Label>
                <Input
                  id="description"
                  v-model="form.description"
                  placeholder="Detalles de la misión..."
                  class="w-full h-11 text-base rounded-none border-2"
                  :disabled="submitting"
                />
              </div>
              <div class="space-y-2">
                <Label class="font-pixel text-[9px] text-muted-foreground uppercase">
                  <span class="text-secondary">▸</span> DIFICULTAD
                </Label>
                <div class="grid grid-cols-4 gap-2">
                  <Button
                    v-for="(exp, diff) in DIFFICULTY_EXP"
                    :key="diff"
                    :variant="form.difficulty === diff ? 'default' : 'outline'"
                    size="sm"
                    class="rounded-none font-pixel text-[8px] uppercase cursor-pointer"
                    :disabled="submitting"
                    @click="form.difficulty = diff as QuestDifficulty"
                  >
                    {{ diff }}
                  </Button>
                </div>
              </div>
              <div class="space-y-2">
                <Label for="due_date" class="font-pixel text-[9px] text-muted-foreground uppercase">
                  <span class="text-exp-medium">▸</span> FECHA LÍMITE
                  <span class="text-muted-foreground/50">(OPCIONAL)</span>
                </Label>
                <DatePicker
                  id="due_date"
                  v-model="form.due_date"
                  placeholder="Selecciona una fecha"
                  class="w-full h-11 text-base"
                  :disabled="submitting"
                />
              </div>
              <div v-if="form.due_date" class="space-y-2">
                <Label for="due_time" class="font-pixel text-[9px] text-muted-foreground uppercase">
                  <span class="text-exp-medium">▸</span> HORA LÍMITE
                  <span class="text-muted-foreground/50">(OPCIONAL)</span>
                </Label>
                <Input
                  id="due_time"
                  v-model="form.due_time"
                  type="time"
                  class="w-full h-11 text-base rounded-none border-2"
                  :disabled="submitting"
                />
              </div>
              <div v-if="form.due_date" class="space-y-2">
                <Label for="reminder" class="font-pixel text-[9px] text-muted-foreground uppercase">
                  <span class="text-exp-easy">▸</span> RECORDATORIO
                  <span class="text-muted-foreground/50">(MIN ANTES)</span>
                </Label>
                <Input
                  id="reminder"
                  v-model.number="form.reminder_minutes_before"
                  type="number"
                  min="0"
                  class="w-full h-11 text-base rounded-none border-2"
                  :disabled="submitting"
                />
              </div>
              <Button
                size="lg"
                class="btn-game w-full h-12 rounded-none font-pixel text-[11px] shadow-[0_5px_0_0_oklch(0.42_0.16_290)] hover:shadow-[0_5px_0_0_oklch(0.52_0.2_290)] hover:brightness-105 active:translate-y-[4px] active:shadow-[0_1px_0_0_oklch(0.42_0.16_290)] transition-[transform,filter,box-shadow,border-color] duration-100 motion-reduce:active:translate-y-0 cursor-pointer"
                :disabled="!form.title.trim() || submitting"
                @click="handleSubmit"
              >
                <Loader2 v-if="submitting" class="animate-spin h-5 w-5 mr-2" aria-hidden="true" />
                <Swords v-else class="h-4 w-4 mr-2" aria-hidden="true" />
                CREAR QUEST
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
