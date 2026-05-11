<script setup lang="ts">
import { BookOpen } from 'lucide-vue-next'
import type { MangaEntry } from '@/composables/useManga'
import { Empty } from '@/components/ui/empty'
import MangaCard from './MangaCard.vue'
import MangaCardSkeleton from './MangaCardSkeleton.vue'

interface Props {
  mangas: MangaEntry[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  addVolume: [id: string]
  removeVolume: [id: string, volume: number]
  delete: [id: string]
  updatePrice: [id: string, price: number | null]
  updateStatus: [id: string, status: MangaEntry['status']]
}>()

function handleAddVolume(id: string) {
  emit('addVolume', id)
}

function handleRemoveVolume(id: string, volume: number) {
  emit('removeVolume', id, volume)
}

function handleDelete(id: string) {
  emit('delete', id)
}

function handleUpdatePrice(id: string, price: number | null) {
  emit('updatePrice', id, price)
}

function handleUpdateStatus(id: string, status: MangaEntry['status']) {
  emit('updateStatus', id, status)
}
</script>

<template>
  <div class="space-y-3">
    <template v-if="loading">
      <MangaCardSkeleton v-for="i in 3" :key="i" />
    </template>

    <Empty
      v-else-if="mangas.length === 0"
      title="No hay mangas en esta categoría"
      description="Añade mangas a tu colección para comenzar"
    >
      <template #icon>
        <BookOpen class="h-12 w-12 text-muted-foreground/30" />
      </template>
    </Empty>

    <template v-else>
      <MangaCard
        v-for="manga in mangas"
        :key="manga.id"
        :manga="manga"
        @add-volume="handleAddVolume"
        @remove-volume="handleRemoveVolume"
        @delete="handleDelete"
        @update-price="handleUpdatePrice"
        @update-status="handleUpdateStatus"
      />
    </template>
  </div>
</template>

