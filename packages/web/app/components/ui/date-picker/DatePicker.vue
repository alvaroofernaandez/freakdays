<script setup lang="ts">
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { Calendar as CalendarIcon } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface Props {
  modelValue?: string | Date | null
  placeholder?: string
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Selecciona una fecha',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const open = ref(false)

const date = computed({
  get: () => {
    if (!props.modelValue) return null
    return typeof props.modelValue === 'string' ? new Date(props.modelValue) : props.modelValue
  },
  set: (value: Date | null) => {
    emit('update:modelValue', value ? format(value, 'yyyy-MM-dd') : null)
    open.value = false
  },
})

const formattedDate = computed(() => {
  if (!date.value) return null
  return format(date.value, 'PPP', { locale: es })
})
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        :class="cn(
          'w-full justify-start text-left font-normal',
          !date && 'text-muted-foreground',
          props.class
        )"
        :disabled="disabled"
      >
        <CalendarIcon class="mr-2 h-4 w-4" />
        <span>{{ formattedDate || placeholder }}</span>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0" align="start">
      <Calendar
        v-model="date"
        :disabled="disabled"
      />
    </PopoverContent>
  </Popover>
</template>

