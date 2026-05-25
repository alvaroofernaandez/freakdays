<script setup lang="ts">
import { Empty } from '@/components/ui/empty';
import type { AnimeSearchResult } from '@/composables/useAnimeSearch';
import { useAnimeSearch } from '@/composables/useAnimeSearch';
import { Loader2, Search, Tv } from 'lucide-vue-next';
import AnimeSearchBar from './AnimeSearchBar.vue';
import AnimeSearchCard from './AnimeSearchCard.vue';

const route = useRoute();

const props = withDefaults(
  defineProps<{
    adding?: boolean;
  }>(),
  {
    adding: false,
  },
);

const animeSearch = useAnimeSearch();
const searchQuery = ref('');
const addingAnimeId = ref<number | null>(null);

const emit = defineEmits<{
  add: [anime: AnimeSearchResult];
  close: [];
  search: [query: string];
}>();

onMounted(() => {
  const urlQuery = route.query.q as string;
  if (urlQuery) {
    searchQuery.value = urlQuery;
    animeSearch.debouncedSearch(urlQuery);
  }
});

function handleSearch(query: string) {
  const trimmedQuery = query?.trim() || '';

  searchQuery.value = query;
  emit('search', query);

  if (trimmedQuery) {
    animeSearch.debouncedSearch(trimmedQuery);
  } else {
    animeSearch.clearSearch();
  }
}

function handleClear() {
  searchQuery.value = '';
  emit('search', '');
  animeSearch.clearSearch();
}

function handleAdd(anime: AnimeSearchResult) {
  if (addingAnimeId.value === anime.mal_id) return;

  addingAnimeId.value = anime.mal_id;
  emit('add', anime);
}

watch(
  () => props.adding,
  (isAdding) => {
    if (!isAdding) {
      addingAnimeId.value = null;
    }
  },
);
</script>

<template>
  <div class="space-y-4">
    <!-- Marketplace header -->
    <div>
      <p
        class="flex items-center gap-1.5 font-pixel text-[9px] text-muted-foreground/80 uppercase mb-1"
      >
        <span class="text-accent">▸</span> MARKETPLACE
      </p>
      <h2 class="text-xl font-bold flex items-center gap-2">
        <Search class="h-5 w-5 text-accent" aria-hidden="true" />
        Buscar Anime
      </h2>
      <p class="font-pixel text-[8px] text-muted-foreground/70 mt-1 uppercase">DESDE MYANIMELIST</p>
    </div>

    <div
      class="w-full relative"
      style="position: relative; z-index: 10; min-height: 60px; pointer-events: auto !important"
    >
      <AnimeSearchBar
        v-model:query="searchQuery"
        :searching="animeSearch.searching.value"
        @search="handleSearch"
        @clear="handleClear"
      />
    </div>

    <div
      v-if="animeSearch.searching.value && animeSearch.searchResults.value.length === 0"
      class="flex flex-col items-center justify-center py-12"
    >
      <Loader2 class="animate-spin w-8 h-8 text-accent mb-4" aria-hidden="true" />
      <p class="font-pixel text-[9px] text-muted-foreground uppercase">BUSCANDO ANIMES…</p>
    </div>

    <div v-else-if="animeSearch.searchResults.value.length > 0" class="space-y-3">
      <div class="flex items-center justify-between">
        <p class="font-pixel text-[8px] text-muted-foreground uppercase">
          {{ animeSearch.searchResults.value.length }} RESULTADO{{
            animeSearch.searchResults.value.length !== 1 ? 'S' : ''
          }}
        </p>
      </div>

      <div class="space-y-2 max-h-[60vh] overflow-y-auto">
        <AnimeSearchCard
          v-for="anime in animeSearch.searchResults.value"
          :key="anime.mal_id"
          :anime="anime as AnimeSearchResult"
          :is-adding="addingAnimeId === anime.mal_id"
          @add="handleAdd"
        />
      </div>

      <Button
        v-if="animeSearch.hasMorePages.value"
        variant="outline"
        class="w-full rounded-none border-2 font-pixel text-[9px] uppercase cursor-pointer"
        :disabled="animeSearch.searching.value"
        @click="animeSearch.loadMoreResults()"
      >
        <Loader2
          v-if="animeSearch.searching.value"
          class="animate-spin h-4 w-4 mr-2"
          aria-hidden="true"
        />
        CARGAR MÁS RESULTADOS
      </Button>
    </div>

    <Empty
      v-else-if="searchQuery && !animeSearch.searching.value"
      title="No se encontraron resultados"
      description="Intenta con otro término de búsqueda"
      class="py-8"
    >
      <template #icon>
        <Search class="h-12 w-12 text-muted-foreground/30" aria-hidden="true" />
      </template>
    </Empty>

    <Empty
      v-else
      title="Busca animes para añadirlos a tu lista"
      description="Ejemplo: One Piece, Naruto, Attack on Titan…"
      class="py-8"
    >
      <template #icon>
        <Tv class="h-12 w-12 text-accent/30" aria-hidden="true" />
      </template>
    </Empty>
  </div>
</template>
