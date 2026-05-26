<script setup lang="ts">
import { X, Play, Loader2 } from 'lucide-vue-next';
import { getTodayDate } from '@/utils/workout-formatters';
import { DatePicker } from '@/components/ui/date-picker';

interface WorkoutForm {
  name: string;
  description: string;
  workout_date: string;
}

const props = defineProps<{
  open: boolean;
  starting?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  start: [workout: WorkoutForm];
}>();

const titleId = 'start-workout-modal-title';

const form = ref<WorkoutForm>({
  name: '',
  description: '',
  workout_date: getTodayDate(),
});

function handleClose() {
  emit('close');
}

function handleStart() {
  if (!form.value.name.trim()) return;
  emit('start', { ...form.value });
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') handleClose();
}

function lockScroll(lock: boolean) {
  if (!import.meta.client) return;
  if (lock) {
    document.addEventListener('keydown', onKeydown);
    document.body.style.overflow = 'hidden';
  } else {
    document.removeEventListener('keydown', onKeydown);
    document.body.style.overflow = '';
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      form.value = {
        name: '',
        description: '',
        workout_date: getTodayDate(),
      };
    }
    lockScroll(isOpen);
  },
);

onBeforeUnmount(() => lockScroll(false));
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-4 bg-background/85 backdrop-blur-md overflow-y-auto motion-safe:animate-in motion-safe:fade-in motion-safe:duration-150"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      @click.self="handleClose"
    >
      <Card
        class="relative w-full max-w-md my-auto flex flex-col max-h-[90dvh] overflow-hidden rounded-none border-2 border-accent/40 shadow-[0_0_0_1px_oklch(0.55_0.13_190/0.25),0_0_60px_-14px_oklch(0.65_0.15_190/0.6)] motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-200"
      >
        <!-- Arcade neon strip -->
        <div
          class="h-1 shrink-0 bg-gradient-to-r from-accent via-primary to-accent"
          aria-hidden="true"
        />

        <CardHeader
          class="shrink-0 flex flex-row items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-accent/30"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <Play
              class="h-5 w-5 shrink-0 text-accent drop-shadow-[0_0_6px_oklch(0.7_0.15_190)]"
              aria-hidden="true"
            />
            <CardTitle
              :id="titleId"
              class="font-pixel text-xs sm:text-sm uppercase tracking-wider text-foreground [text-shadow:_0_0_12px_oklch(0.7_0.15_190_/_0.45)] truncate"
            >
              Nuevo Entrenamiento
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-none hover:bg-accent/10 hover:text-accent cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Cerrar"
            @click="handleClose"
          >
            <X class="h-4 w-4" aria-hidden="true" />
          </Button>
        </CardHeader>

        <CardContent class="flex-1 min-h-0 overflow-y-auto space-y-4 pt-4 sm:pt-6">
          <div class="space-y-2">
            <Label for="name" class="font-pixel text-[9px] text-muted-foreground uppercase">
              <span class="text-primary">▸</span> NOMBRE DEL ENTRENAMIENTO
            </Label>
            <Input
              id="name"
              v-model="form.name"
              placeholder="Ej: Push Day, Pierna, Full Body..."
              class="w-full h-11 text-base rounded-none border-2"
              autofocus
            />
          </div>

          <div class="space-y-2">
            <Label for="date" class="font-pixel text-[9px] text-muted-foreground uppercase">
              <span class="text-accent">▸</span> FECHA
            </Label>
            <DatePicker
              id="date"
              v-model="form.workout_date"
              placeholder="Selecciona una fecha"
              class="w-full h-11 text-base"
            />
          </div>

          <div class="space-y-2">
            <Label for="description" class="font-pixel text-[9px] text-muted-foreground uppercase">
              <span class="text-exp-medium">▸</span> NOTAS
              <span class="text-muted-foreground/50">(OPCIONAL)</span>
            </Label>
            <Input
              id="description"
              v-model="form.description"
              placeholder="Notas sobre el entrenamiento..."
              class="w-full h-11 text-base rounded-none border-2"
            />
          </div>

          <Button
            size="lg"
            class="btn-game w-full h-12 rounded-none font-pixel text-[11px] uppercase shadow-[0_4px_0_0_oklch(0.35_0.15_190)] hover:shadow-[0_4px_0_0_oklch(0.45_0.18_190)] active:translate-y-[3px] active:shadow-none transition-[transform,box-shadow] duration-100 motion-reduce:active:translate-y-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent mt-2"
            :disabled="!form.name.trim() || starting"
            @click="handleStart"
          >
            <Play v-if="!starting" class="h-5 w-5 mr-2" aria-hidden="true" />
            <Loader2 v-else class="h-5 w-5 mr-2 animate-spin" aria-hidden="true" />
            {{ starting ? 'INICIANDO...' : 'INICIAR ENTRENAMIENTO' }}
          </Button>
        </CardContent>
      </Card>
    </div>
  </Teleport>
</template>
