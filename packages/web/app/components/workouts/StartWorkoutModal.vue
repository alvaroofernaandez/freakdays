<script setup lang="ts">
import { X, Play, Loader2 } from 'lucide-vue-next'
import { getTodayDate } from '@/utils/workout-formatters'
import { DatePicker } from '@/components/ui/date-picker'

interface WorkoutForm {
  name: string
  description: string
  workout_date: string
}

const props = defineProps<{
  open: boolean
  starting?: boolean
}>()

const emit = defineEmits<{
  close: []
  start: [workout: WorkoutForm]
}>()

const form = ref<WorkoutForm>({
  name: '',
  description: '',
  workout_date: getTodayDate(),
})

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    form.value = {
      name: '',
      description: '',
      workout_date: getTodayDate(),
    }
  }
})

function handleStart() {
  if (!form.value.name.trim()) return
  emit('start', { ...form.value })
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/95 backdrop-blur-sm overflow-y-auto">
    <Card class="w-full max-w-md my-auto shadow-xl border-2">
      <CardHeader class="flex flex-row items-center justify-between pb-3 sm:pb-4 border-b">
        <CardTitle class="text-lg sm:text-xl">Nuevo Entrenamiento</CardTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          class="h-8 w-8 sm:h-9 sm:w-9 hover:bg-muted hover:text-foreground cursor-pointer" 
          @click="emit('close')"
        >
          <X class="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent class="space-y-4 pt-4 sm:pt-6">
        <div class="space-y-2">
          <Label for="name" class="text-sm font-medium">Nombre del entrenamiento</Label>
          <Input 
            id="name" 
            v-model="form.name" 
            placeholder="Ej: Push Day, Pierna, Full Body..." 
            class="w-full h-11 text-base"
            autofocus
          />
        </div>
        
        <div class="space-y-2">
          <Label for="date" class="text-sm font-medium">Fecha</Label>
          <DatePicker 
            id="date" 
            v-model="form.workout_date" 
            placeholder="Selecciona una fecha"
            class="w-full h-11 text-base"
          />
        </div>

        <div class="space-y-2">
          <Label for="description" class="text-sm font-medium">Notas (opcional)</Label>
          <Input 
            id="description" 
            v-model="form.description" 
            placeholder="Notas sobre el entrenamiento..." 
            class="w-full h-11 text-base"
          />
        </div>

        <Button 
          size="lg" 
          class="w-full h-12 text-base font-semibold mt-2" 
          @click="handleStart" 
          :disabled="!form.name.trim() || starting"
        >
          <Play v-if="!starting" class="h-5 w-5 mr-2" />
          <Loader2 v-else class="h-5 w-5 mr-2 animate-spin" />
          {{ starting ? 'Iniciando...' : 'Iniciar Entrenamiento' }}
        </Button>
      </CardContent>
    </Card>
  </div>
</template>

