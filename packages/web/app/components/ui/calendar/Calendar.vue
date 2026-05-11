<script setup lang="ts">
import { ref, computed } from 'vue'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface Props {
  modelValue?: Date | string | null
  defaultDate?: Date
  class?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  defaultDate: () => new Date(),
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: Date | null]
}>()

const getInitialMonth = () => {
  if (props.modelValue) {
    return typeof props.modelValue === 'string' ? new Date(props.modelValue) : props.modelValue
  }
  return props.defaultDate
}

const currentMonth = ref(getInitialMonth())

const monthStart = computed(() => startOfMonth(currentMonth.value))
const monthEnd = computed(() => endOfMonth(currentMonth.value))
const calendarStart = computed(() => startOfWeek(monthStart.value, { locale: es }))
const calendarEnd = computed(() => endOfWeek(monthEnd.value, { locale: es }))

const days = computed(() => eachDayOfInterval({
  start: calendarStart.value,
  end: calendarEnd.value,
}))

const selectedDate = computed(() => {
  if (!props.modelValue) return null
  return typeof props.modelValue === 'string' ? new Date(props.modelValue) : props.modelValue
})

const monthYear = computed(() => format(currentMonth.value, 'MMMM yyyy', { locale: es }))

function selectDate(date: Date) {
  if (props.disabled) return
  emit('update:modelValue', date)
}

function previousMonth() {
  currentMonth.value = subMonths(currentMonth.value, 1)
}

function nextMonth() {
  currentMonth.value = addMonths(currentMonth.value, 1)
}

const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
</script>

<template>
  <div :class="cn('p-3', props.class)">
    <div class="flex items-center justify-between mb-4">
      <Button
        variant="outline"
        size="icon"
        class="h-7 w-7"
        @click="previousMonth"
        :disabled="disabled"
      >
        <ChevronLeft class="h-4 w-4" />
      </Button>
      <div class="font-semibold capitalize">{{ monthYear }}</div>
      <Button
        variant="outline"
        size="icon"
        class="h-7 w-7"
        @click="nextMonth"
        :disabled="disabled"
      >
        <ChevronRight class="h-4 w-4" />
      </Button>
    </div>
    <div class="grid grid-cols-7 gap-1 mb-2">
      <div
        v-for="day in weekDays"
        :key="day"
        class="text-center text-sm font-medium text-muted-foreground h-8 flex items-center justify-center"
      >
        {{ day }}
      </div>
    </div>
    <div class="grid grid-cols-7 gap-1">
      <button
        v-for="day in days"
        :key="day.toISOString()"
        type="button"
        :class="cn(
          'h-9 w-9 rounded-md text-sm font-normal transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          !isSameMonth(day, currentMonth) && 'text-muted-foreground opacity-50',
          isSameDay(day, selectedDate!) && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
          isToday(day) && !isSameDay(day, selectedDate!) && 'bg-accent text-accent-foreground',
          disabled && 'pointer-events-none opacity-50'
        )"
        @click="selectDate(day)"
      >
        {{ format(day, 'd') }}
      </button>
    </div>
  </div>
</template>

