<script setup lang="ts">
import type { AnimeSearchResult } from '@/composables/useAnimeSearch';
import { Calendar, Plus, Star, Tv } from 'lucide-vue-next';

interface Props {
  anime: AnimeSearchResult | Readonly<AnimeSearchResult>
  isAdding?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isAdding: false,
})

const emit = defineEmits<{
  add: [anime: AnimeSearchResult]
}>()

const coverUrl = computed(() =>
  props.anime.images?.jpg?.large_image_url ||
  props.anime.images?.jpg?.image_url ||
  props.anime.images?.webp?.large_image_url ||
  null
)

const displayTitle = computed(() =>
  props.anime.title_english || props.anime.title
)

const synopsis = computed(() => {
  if (!props.anime.synopsis) return null
  return props.anime.synopsis.length > 150
    ? props.anime.synopsis.substring(0, 150) + '...'
    : props.anime.synopsis
})
</script>

<template>
  <Card class="group hover:border-primary/50 transition-all overflow-hidden">
    <div class="flex gap-4 p-4">
      <div class="relative w-20 h-28 sm:w-24 sm:h-32 rounded-lg overflow-hidden shrink-0 bg-muted">
        <img v-if="coverUrl" :src="coverUrl" :alt="displayTitle"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div v-else class="w-full h-full flex items-center justify-center">
          <Tv class="h-8 w-8 text-muted-foreground/50" />
        </div>
      </div>

      <div class="flex-1 min-w-0 space-y-2">
        <div>
          <h3 class="font-semibold text-sm sm:text-base line-clamp-2 group-hover:text-primary transition-colors">
            {{ displayTitle }}
          </h3>
          <p v-if="anime.title_japanese && anime.title_japanese !== anime.title"
            class="text-xs text-muted-foreground mt-0.5">
            {{ anime.title_japanese }}
          </p>
        </div>

        <div v-if="synopsis" class="text-xs sm:text-sm text-muted-foreground line-clamp-3">
          {{ synopsis }}
        </div>

        <div class="flex flex-wrap items-center gap-2 text-xs">
          <div v-if="anime.score" class="flex items-center gap-1 text-exp-legendary">
            <Star class="h-3 w-3 fill-current" />
            <span class="font-medium">{{ anime.score.toFixed(1) }}</span>
          </div>
          <div v-if="anime.episodes" class="flex items-center gap-1 text-muted-foreground">
            <Tv class="h-3 w-3" />
            <span>{{ anime.episodes }} eps</span>
          </div>
          <div v-if="anime.year" class="flex items-center gap-1 text-muted-foreground">
            <Calendar class="h-3 w-3" />
            <span>{{ anime.year }}</span>
          </div>
          <Badge v-if="anime.type" variant="outline" class="text-[10px]">
            {{ anime.type }}
          </Badge>
        </div>

        <div v-if="anime.genres && anime.genres.length > 0" class="flex flex-wrap gap-1">
          <Badge v-for="genre in anime.genres.slice(0, 3)" :key="genre.mal_id" variant="secondary" class="text-[10px]">
            {{ genre.name }}
          </Badge>
        </div>
      </div>

      <div class="shrink-0">
        <Button size="sm" class="h-9 w-9 p-0" :disabled="isAdding" @click="emit('add', anime)">
          <Plus v-if="!isAdding" class="h-4 w-4" />
          <div v-else
            class="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
        </Button>
      </div>
    </div>
  </Card>
</template>
