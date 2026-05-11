<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, Trash2, Tv, User } from 'lucide-vue-next'
import { computed } from 'vue'
import type { PartyAnimeItem } from '~~/domain/types/party'

const props = withDefaults(defineProps<{
  anime: PartyAnimeItem
  isDeleting?: boolean
}>(), {
  isDeleting: false,
})

const emit = defineEmits<{
  (e: 'delete', id: string): void
}>()

const progress = computed(() => {
  if (!props.anime.totalEpisodes) return 0
  return Math.round((props.anime.currentEpisode / props.anime.totalEpisodes) * 100)
})

const addedBy = computed(() => props.anime.addedByUser?.displayName || props.anime.addedByUser?.username || 'Unknown')

const statusLabels: Record<string, string> = {
  watching: 'En curso',
  completed: 'Completado',
  on_hold: 'En pausa',
  dropped: 'Droppeado',
  plan_to_watch: 'Pendiente',
}
</script>

<template>
  <Card
    :class="[
      'group transition-all overflow-hidden',
      isDeleting ? 'opacity-50 pointer-events-none' : 'hover:border-primary/30 hover:shadow-md',
    ]"
    role="article"
    :aria-label="`${anime.title}, ${statusLabels[anime.status] || anime.status}, episodio ${anime.currentEpisode} de ${anime.totalEpisodes || '?'}`"
  >
    <div class="flex gap-3 sm:gap-4 p-3 sm:p-4">
      <div
        class="relative w-20 h-28 sm:w-24 sm:h-32 rounded-lg overflow-hidden shrink-0 bg-muted group-hover:ring-2 ring-primary/20 transition-all"
      >
        <img
          v-if="anime.coverUrl"
          :src="anime.coverUrl"
          :alt="`Portada de ${anime.title}`"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div v-else class="w-full h-full flex items-center justify-center">
          <Tv class="h-8 w-8 text-muted-foreground/50" aria-hidden="true" />
        </div>
        <div
          v-if="anime.status === 'watching' && anime.totalEpisodes"
          class="absolute bottom-0 left-0 right-0 h-1.5 bg-background/50"
          role="progressbar"
          :aria-valuenow="progress"
          aria-valuemin="0"
          :aria-valuemax="anime.totalEpisodes"
          :aria-label="`Progreso: ${anime.currentEpisode} de ${anime.totalEpisodes} episodios`"
        >
          <div
            class="h-full bg-primary transition-all duration-300"
            :style="{ width: `${progress}%` }"
          />
        </div>
      </div>

      <div class="flex-1 min-w-0 space-y-2">
        <div class="flex justify-between items-start gap-2">
          <h3
            class="font-semibold text-sm sm:text-base line-clamp-2 group-hover:text-primary transition-colors flex-1 min-w-0"
          >
            {{ anime.title }}
          </h3>
          <div
            class="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full shrink-0"
            :title="`Añadido por ${addedBy}`"
          >
            <User class="h-3 w-3 shrink-0" aria-hidden="true" />
            <span class="truncate max-w-[80px] sm:max-w-none">{{ addedBy }}</span>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <Badge
            :variant="anime.status === 'completed' ? 'default' : 'outline'"
            class="text-[10px] font-medium"
          >
            {{ statusLabels[anime.status] || anime.status }}
          </Badge>
          <span v-if="anime.score" class="text-xs font-medium text-yellow-500 flex items-center gap-0.5">
            <span aria-hidden="true">★</span>
            <span>{{ anime.score }}</span>
          </span>
        </div>

        <div class="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
          <span class="font-medium">Ep. {{ anime.currentEpisode }}</span>
          <span v-if="anime.totalEpisodes">/ {{ anime.totalEpisodes }}</span>
          <span v-if="anime.totalEpisodes && progress > 0" class="text-primary font-medium">
            ({{ progress }}%)
          </span>
        </div>
      </div>

      <div class="flex flex-col items-end gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          class="h-9 w-9 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          :disabled="isDeleting"
          @click="emit('delete', anime.id)"
          :aria-label="`Eliminar ${anime.title} de la lista`"
        >
          <Loader2 v-if="isDeleting" class="h-4 w-4 animate-spin" aria-hidden="true" />
          <Trash2 v-else class="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  </Card>
</template>
