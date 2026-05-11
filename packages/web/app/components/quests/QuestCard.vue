<script setup lang="ts">
import { CheckCircle2, Trash2, Clock, Calendar } from 'lucide-vue-next'
import type { Quest } from '~~/domain/types'
import { formatDueDate, formatDueTime, getTimeRemaining } from '@/utils/quest-formatters'
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '@/utils/quest-constants'

interface Props {
  quest: Quest
  isCompleted?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isCompleted: false,
})

const emit = defineEmits<{
  complete: [id: string]
  delete: [id: string]
}>()
</script>

<template>
  <Card 
    :class="[
      'transition-all active:scale-[0.98]',
      quest.isOverdue ? 'border-destructive/50 bg-destructive/5' : '',
      quest.isDueSoon && !quest.isOverdue ? 'border-exp-hard/50 bg-exp-hard/5' : '',
      isCompleted ? 'opacity-70 hover:opacity-100' : ''
    ]"
  >
    <CardHeader class="py-3 sm:py-4 px-3 sm:px-4">
      <div class="flex items-start gap-3">
        <button 
          v-if="!isCompleted"
          class="mt-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-muted-foreground/30 hover:border-primary transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          @click="emit('complete', quest.id)"
        >
          <CheckCircle2 v-if="isCompleted" class="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        </button>
        <div v-else class="mt-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-exp-easy flex items-center justify-center shrink-0">
          <CheckCircle2 class="h-4 w-4 sm:h-5 sm:w-5 text-background" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap mb-1">
            <CardTitle class="text-sm sm:text-base font-medium" :class="isCompleted ? 'line-through' : ''">
              {{ quest.title }}
            </CardTitle>
            <Badge :class="DIFFICULTY_COLORS[quest.difficulty]" class="text-[10px] px-1.5 py-0">
              {{ DIFFICULTY_LABELS[quest.difficulty] }}
            </Badge>
            <Badge 
              v-if="quest.isOverdue && !isCompleted"
              variant="destructive"
              class="text-[10px] px-1.5 py-0"
            >
              Atrasada
            </Badge>
            <Badge 
              v-else-if="quest.isDueSoon && !isCompleted"
              class="text-[10px] px-1.5 py-0 bg-exp-hard/20 text-exp-hard border-exp-hard/30"
            >
              Próxima
            </Badge>
          </div>
          <CardDescription v-if="quest.description" class="text-xs sm:text-sm mt-0.5 line-clamp-2">
            {{ quest.description }}
          </CardDescription>
          <div class="flex items-center gap-3 mt-2 flex-wrap">
            <span class="text-xs sm:text-sm text-exp-legendary font-medium">+{{ quest.exp }} EXP</span>
            <div v-if="quest.dueDate" class="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar class="h-3 w-3" />
              <span>{{ formatDueDate(quest) }}</span>
              <span v-if="quest.dueTime">{{ formatDueTime(quest) }}</span>
              <span v-if="!quest.isOverdue && !isCompleted" class="text-exp-hard">· {{ getTimeRemaining(quest) }}</span>
            </div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          class="h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer shrink-0"
          @click="emit('delete', quest.id)"
        >
          <Trash2 class="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
  </Card>
</template>


