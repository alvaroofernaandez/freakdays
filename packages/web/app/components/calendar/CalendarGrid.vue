<script setup lang="ts">
import { Button } from '@/components/ui/button'
import type { Release } from '@/composables/useCalendar'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import CalendarDay from './CalendarDay.vue'
import CalendarGridSkeleton from './CalendarGridSkeleton.vue'

interface Props {
  currentMonth: Date
  events: readonly Release[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  'update:currentMonth': [date: Date]
  'update:event': [eventId: string, date: Date]
  'delete': [id: string]
  'deleteRequest': [release: Release]
  'editRequest': [release: Release]
  'dayClick': [date: Date]
  'add': []
}>()

const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const draggingEventId = ref<string | null>(null)
const hoveredDate = ref<Date | null>(null)

const monthName = computed(() =>
  props.currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
)

const calendarDays = computed(() => {
  const year = props.currentMonth.getFullYear()
  const month = props.currentMonth.getMonth()
  const firstDay = new Date(year, month, 1)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - startDate.getDay())

  const days: Date[] = []
  const current = new Date(startDate)

  for (let i = 0; i < 42; i++) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  return days
})

const today = computed(() => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
})

function isToday(date: Date): boolean {
  return (
    date.getDate() === today.value.getDate() &&
    date.getMonth() === today.value.getMonth() &&
    date.getFullYear() === today.value.getFullYear()
  )
}

function isCurrentMonth(date: Date): boolean {
  return date.getMonth() === props.currentMonth.getMonth() && date.getFullYear() === props.currentMonth.getFullYear()
}

function normalizeDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0)
}

function getEventsForDate(date: Date): Release[] {
  const normalizedDate = normalizeDate(date)
  return props.events.filter((event) => {
    const eventDate = normalizeDate(event.releaseDate)
    return (
      eventDate.getDate() === normalizedDate.getDate() &&
      eventDate.getMonth() === normalizedDate.getMonth() &&
      eventDate.getFullYear() === normalizedDate.getFullYear()
    )
  })
}

function goToToday() {
  const now = new Date()
  emit('update:currentMonth', now)
}

function previousMonth() {
  const newDate = new Date(props.currentMonth)
  newDate.setMonth(newDate.getMonth() - 1)
  emit('update:currentMonth', newDate)
}

function nextMonth() {
  const newDate = new Date(props.currentMonth)
  newDate.setMonth(newDate.getMonth() + 1)
  emit('update:currentMonth', newDate)
}

function handleDrop(date: Date, eventId: string) {
  emit('update:event', eventId, date)
  draggingEventId.value = null
  hoveredDate.value = null
}

function handleDragStart(eventId: string) {
  draggingEventId.value = eventId
}

function handleDragEnd() {
  draggingEventId.value = null
  hoveredDate.value = null
}

function handleDateHover(date: Date | null) {
  hoveredDate.value = date
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    previousMonth()
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    nextMonth()
  } else if (e.key === 'Home') {
    e.preventDefault()
    goToToday()
  }
}
</script>

<template>
  <div class="space-y-1 sm:space-y-1.5 flex-1 flex flex-col min-h-0" @keydown="handleKeydown" tabindex="0">
    <div class="flex items-center justify-between gap-2 px-2 sm:px-3 py-2 sm:py-1.5 shrink-0">
      <div class="flex items-center gap-1 sm:gap-1.5 flex-1">
        <Button variant="ghost" size="icon"
          class="h-10 w-10 sm:h-8 sm:w-8 touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px]"
          @click="previousMonth" aria-label="Mes anterior">
          <ChevronLeft class="h-4 w-4 sm:h-4 sm:w-4" />
        </Button>
        <h2 class="text-sm sm:text-base font-bold capitalize min-w-0 flex-1 text-center px-1">
          {{ monthName }}
        </h2>
        <Button variant="ghost" size="icon"
          class="h-10 w-10 sm:h-8 sm:w-8 touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px]"
          @click="nextMonth" aria-label="Mes siguiente">
          <ChevronRight class="h-4 w-4 sm:h-4 sm:w-4" />
        </Button>
      </div>
      <Button variant="outline" size="sm"
        class="h-10 sm:h-8 px-3 sm:px-3 text-xs touch-manipulation shrink-0 min-h-[44px] sm:min-h-[32px]"
        @click="goToToday" aria-label="Ir a hoy">
        <CalendarIcon class="h-4 w-4 sm:h-3.5 sm:w-3.5 sm:mr-1.5" />
        <span class="hidden sm:inline">Hoy</span>
      </Button>
    </div>

    <CalendarGridSkeleton v-if="loading" />

    <div v-else class="space-y-1 sm:space-y-1.5 flex-1 flex flex-col min-h-0">
      <div class="grid grid-cols-7 gap-0.5 sm:gap-1 shrink-0">
        <div v-for="day in weekDays" :key="day"
          class="text-center text-[10px] sm:text-sm font-semibold text-muted-foreground py-1 sm:py-1.5 px-0.5 sm:px-1"
          role="columnheader">
          <span class="hidden sm:inline">{{ day }}</span>
          <span class="sm:hidden">{{ day.charAt(0) }}</span>
        </div>
      </div>

      <div class="grid grid-cols-7 gap-0.5 sm:gap-2 flex-1 min-h-0 relative overflow-visible" role="grid"
        style="z-index: 1">
        <CalendarDay v-for="(day, index) in calendarDays" :key="`${day.getTime()}-${index}`" :date="day"
          :events="getEventsForDate(day)" :is-today="isToday(day)" :is-current-month="isCurrentMonth(day)"
          :is-dragging="draggingEventId !== null" :is-hovered="hoveredDate?.getTime() === day.getTime()"
          @drop="handleDrop" @delete="emit('delete', $event)" @deleteRequest="emit('deleteRequest', $event)"
          @editRequest="emit('editRequest', $event)" @dayClick="emit('dayClick', $event)" @dragstart="handleDragStart"
          @dragend="handleDragEnd" @hover="handleDateHover" />
      </div>
    </div>
  </div>
</template>
