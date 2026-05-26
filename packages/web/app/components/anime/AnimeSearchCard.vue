<script setup lang="ts">
import type { AnimeSearchResult } from '@/composables/useAnimeSearch';
import { Calendar, Plus, Star, Tv } from 'lucide-vue-next';

interface Props {
  anime: AnimeSearchResult | Readonly<AnimeSearchResult>;
  isAdding?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isAdding: false,
});

const emit = defineEmits<{
  add: [anime: AnimeSearchResult];
}>();

const coverUrl = computed(
  () =>
    props.anime.images?.jpg?.large_image_url ||
    props.anime.images?.jpg?.image_url ||
    props.anime.images?.webp?.large_image_url ||
    null,
);

const displayTitle = computed(() => props.anime.title_english || props.anime.title);

const synopsis = computed(() => {
  if (!props.anime.synopsis) return null;
  return props.anime.synopsis.length > 150
    ? props.anime.synopsis.substring(0, 150) + '...'
    : props.anime.synopsis;
});
</script>

<template>
  <Card
    class="group rounded-none border-2 overflow-hidden transition-[border-color,box-shadow] duration-100 hover:border-accent/50 hover:shadow-[0_0_20px_-6px_var(--color-accent)]"
  >
    <div class="flex gap-4 p-4">
      <div
        class="relative w-20 h-28 sm:w-24 sm:h-32 overflow-hidden shrink-0 bg-muted rounded-none"
      >
        <img
          v-if="coverUrl"
          :src="coverUrl"
          :alt="displayTitle"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          decoding="async"
        />
        <div v-else class="w-full h-full flex items-center justify-center" aria-hidden="true">
          <Tv class="h-8 w-8 text-muted-foreground/50" />
        </div>
      </div>

      <div class="flex-1 min-w-0 space-y-2">
        <div>
          <h3
            class="font-semibold text-sm sm:text-base line-clamp-2 group-hover:text-accent transition-colors"
          >
            {{ displayTitle }}
          </h3>
          <p
            v-if="anime.title_japanese && anime.title_japanese !== anime.title"
            class="text-xs text-muted-foreground mt-0.5"
          >
            {{ anime.title_japanese }}
          </p>
        </div>

        <div v-if="synopsis" class="text-xs sm:text-sm text-muted-foreground line-clamp-3">
          {{ synopsis }}
        </div>

        <div class="flex flex-wrap items-center gap-2 text-xs">
          <div v-if="anime.score" class="flex items-center gap-1 text-exp-legendary">
            <Star class="h-3 w-3 fill-current" aria-hidden="true" />
            <span class="font-pixel text-[9px]">{{ anime.score.toFixed(1) }}</span>
          </div>
          <div v-if="anime.episodes" class="flex items-center gap-1 text-muted-foreground">
            <Tv class="h-3 w-3" aria-hidden="true" />
            <span class="font-pixel text-[8px]">{{ anime.episodes }} eps</span>
          </div>
          <div v-if="anime.year" class="flex items-center gap-1 text-muted-foreground">
            <Calendar class="h-3 w-3" aria-hidden="true" />
            <span class="font-pixel text-[8px]">{{ anime.year }}</span>
          </div>
          <Badge v-if="anime.type" variant="outline" class="font-pixel text-[8px] rounded-none">
            {{ anime.type }}
          </Badge>
        </div>

        <div v-if="anime.genres && anime.genres.length > 0" class="flex flex-wrap gap-1">
          <Badge
            v-for="genre in anime.genres.slice(0, 3)"
            :key="genre.mal_id"
            variant="secondary"
            class="font-pixel text-[8px] rounded-none"
          >
            {{ genre.name }}
          </Badge>
        </div>
      </div>

      <div class="shrink-0">
        <Button
          size="sm"
          class="h-9 w-9 p-0 rounded-none border-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring shadow-[0_4px_0_0_oklch(0.35_0.15_190)] hover:shadow-[0_4px_0_0_oklch(0.45_0.18_190)] active:translate-y-[3px] active:shadow-none transition-[transform,box-shadow] duration-100 motion-reduce:active:translate-y-0"
          :disabled="isAdding"
          :aria-label="`Añadir ${displayTitle} a mi lista`"
          @click="emit('add', anime as AnimeSearchResult)"
        >
          <Plus v-if="!isAdding" class="h-4 w-4" aria-hidden="true" />
          <div
            v-else
            class="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent"
            aria-hidden="true"
          />
        </Button>
      </div>
    </div>
  </Card>
</template>
