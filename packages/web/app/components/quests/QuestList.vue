<script setup lang="ts">
import { Plus, Trophy, Clock, Loader2 } from 'lucide-vue-next'
import type { Quest } from '~~/domain/types'
import { Empty } from '@/components/ui/empty'
import QuestCard from './QuestCard.vue'
import QuestCardSkeleton from './QuestCardSkeleton.vue'

interface Props {
  quests: Quest[]
  loading: boolean
  isCompleted?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isCompleted: false,
})

const emit = defineEmits<{
  complete: [id: string]
  delete: [id: string]
  add: []
}>()
</script>

<template>
  <div>
    <template v-if="loading">
      <QuestCardSkeleton v-for="i in 3" :key="i" />
    </template>

    <Empty
      v-else-if="quests.length === 0"
      :title="isCompleted ? 'Aún no has completado ninguna quest' : '¡Todas las quests completadas!'"
      :description="isCompleted ? 'Completa tus primeras misiones para ganar EXP' : 'Crea una nueva misión para continuar'"
    >
      <template #icon>
        <Trophy v-if="!isCompleted" class="h-12 w-12 text-primary/50" />
        <Clock v-else class="h-12 w-12 text-muted-foreground/50" />
      </template>
      <template #action>
        <Button v-if="!isCompleted" variant="outline" size="lg" @click="emit('add')">
          <Plus class="h-4 w-4 mr-2" />
          Nueva misión
        </Button>
      </template>
    </Empty>

    <div v-else class="space-y-2 sm:space-y-3">
      <QuestCard
        v-for="quest in quests"
        :key="quest.id"
        :quest="quest"
        :is-completed="isCompleted"
        @complete="emit('complete', $event)"
        @delete="emit('delete', $event)"
      />
    </div>
  </div>
</template>

