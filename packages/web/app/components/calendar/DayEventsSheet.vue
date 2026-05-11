<script setup lang="ts">
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-vue-next'
import type { Release } from '@/composables/useCalendar'

interface Props {
  open: boolean
  date: Date | null
  events: readonly Release[]
  isSubmitting: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'update:event': [eventId: string, date: Date]
  'edit': [release: Release]
  'delete': [release: Release]
  'add': [date: Date]
}>()

const selectedEvent = ref<Release | null>(null)
const newDate = ref<Date | null>(null)

watch(() => props.date, (date) => {
  if (date) {
    newDate.value = new Date(date)
  }
}, { immediate: true })

watch(() => props.open, (open) => {
  if (open && props.date) {
    newDate.value = new Date(props.date)
    selectedEvent.value = null
  }
})

const formattedDate = computed(() => {
  if (!props.date) return ''
  return props.date.toLocaleDateString('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
})

function handleChangeDate(event: Release) {
  if (!newDate.value) return
  emit('update:event', event.id, newDate.value)
  selectedEvent.value = null
}

function handleEdit(event: Release) {
  emit('edit', event)
  emit('update:open', false)
}

function handleDelete(event: Release) {
  emit('delete', event)
}

function handleClose() {
  emit('update:open', false)
  selectedEvent.value = null
}
</script>

<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)">
    <SheetContent side="bottom" class="w-full max-h-[80vh] overflow-y-auto">
      <SheetHeader>
        <SheetTitle class="text-lg sm:text-xl flex items-center gap-2">
          <CalendarIcon class="h-5 w-5 text-primary" />
          Eventos del {{ formattedDate }}
        </SheetTitle>
        <SheetDescription class="text-sm">
          {{ events.length }} {{ events.length === 1 ? 'evento' : 'eventos' }} programado{{ events.length === 1 ? '' : 's' }} para este día
        </SheetDescription>
      </SheetHeader>

      <div v-if="date && events.length > 0" class="mt-6 space-y-3">
        <div
          v-for="event in events"
          :key="event.id"
          class="p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
        >
          <div v-if="selectedEvent?.id !== event.id" class="space-y-3">
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-base mb-1">{{ event.title }}</h3>
                <p class="text-sm text-muted-foreground">
                  {{ event.type === 'anime_episode' ? 'Episodio Anime' : event.type === 'manga_volume' ? 'Tomo Manga' : 'Evento' }}
                </p>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-9 w-9 touch-manipulation"
                  @click="handleEdit(event)"
                  aria-label="Editar evento"
                >
                  <Edit2 class="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-9 w-9 touch-manipulation text-destructive hover:text-destructive"
                  @click="handleDelete(event)"
                  aria-label="Eliminar evento"
                >
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button
              variant="outline"
              class="w-full min-h-[44px] touch-manipulation"
              @click="selectedEvent = event"
            >
              <CalendarIcon class="h-4 w-4 mr-2" />
              Cambiar fecha
            </Button>
          </div>

          <div v-else class="space-y-4">
            <div>
              <h3 class="font-semibold text-base mb-2">{{ event.title }}</h3>
              <p class="text-sm text-muted-foreground mb-4">
                Selecciona la nueva fecha para este evento
              </p>
            </div>
            <DatePicker
              v-model="newDate"
              placeholder="Selecciona una fecha"
              class="w-full h-11"
            />
            <div class="flex gap-2">
              <Button
                variant="outline"
                class="flex-1 min-h-[44px] touch-manipulation"
                @click="selectedEvent = null"
                :disabled="isSubmitting"
              >
                Cancelar
              </Button>
              <Button
                class="flex-1 min-h-[44px] touch-manipulation"
                @click="handleChangeDate(event)"
                :disabled="!newDate || isSubmitting"
              >
                {{ isSubmitting ? 'Guardando...' : 'Guardar' }}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="date && events.length === 0" class="mt-6 space-y-4">
        <div class="text-center py-6">
          <CalendarIcon class="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p class="text-muted-foreground mb-6">No hay eventos programados para este día</p>
        </div>
        <Button
          class="w-full min-h-[44px] touch-manipulation glow-primary"
          @click="emit('add', date!)"
        >
          <CalendarIcon class="h-4 w-4 mr-2" />
          Añadir evento para este día
        </Button>
      </div>
    </SheetContent>
  </Sheet>
</template>

