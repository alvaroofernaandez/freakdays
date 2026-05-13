# Ejemplos de Código - FreakDays

Ejemplos prácticos y completos de código siguiendo las mejores prácticas de FreakDays.

## 📚 Índice

- [Composables](#composables)
- [Componentes](#componentes)
- [Páginas](#páginas)
- [Stores](#stores)
- [Utilidades](#utilidades)

---

## Composables

### Ejemplo Completo: useAnime

```typescript
// app/composables/useAnime.ts
import { useAuthStore } from '~~/stores/auth';
import { useSupabase } from './useSupabase';

export type AnimeStatus =
  | 'watching'
  | 'completed'
  | 'on_hold'
  | 'dropped'
  | 'plan_to_watch'
  | 'rewatching';

export interface AnimeEntry {
  id: string;
  title: string;
  status: AnimeStatus;
  currentEpisode: number;
  totalEpisodes: number | null;
  score: number | null;
  notes: string | null;
  coverUrl: string | null;
  startDate: Date | null;
  endDate: Date | null;
  rewatchCount: number;
}

export interface CreateAnimeDTO {
  title: string;
  status: AnimeStatus;
  total_episodes?: number;
  score?: number;
  cover_url?: string;
  notes?: string;
}

export function useAnime() {
  const supabase = useSupabase();
  const authStore = useAuthStore();

  async function fetchAnimeList(): Promise<AnimeEntry[]> {
    if (!authStore.userId) return [];

    const { data, error } = await supabase
      .from('anime_list')
      .select('*')
      .eq('user_id', authStore.userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return (data ?? []).map(mapDbToAnime);
  }

  async function fetchByStatus(status: AnimeStatus): Promise<AnimeEntry[]> {
    if (!authStore.userId) return [];

    const { data, error } = await supabase
      .from('anime_list')
      .select('*')
      .eq('user_id', authStore.userId)
      .eq('status', status)
      .order('title');

    if (error) throw error;

    return (data ?? []).map(mapDbToAnime);
  }

  async function addAnime(dto: CreateAnimeDTO): Promise<AnimeEntry | null> {
    if (!authStore.userId) return null;

    if (!dto.title || !dto.title.trim()) {
      throw new Error('Title is required');
    }

    const { data, error } = await supabase
      .from('anime_list')
      .insert({
        user_id: authStore.userId,
        title: dto.title.trim(),
        status: dto.status,
        total_episodes: dto.total_episodes || null,
        score: dto.score || null,
        cover_url: dto.cover_url || null,
        notes: dto.notes || null,
        current_episode: 0,
      })
      .select()
      .single();

    if (error) throw error;

    return data ? mapDbToAnime(data) : null;
  }

  async function updateProgress(id: string, episode: number): Promise<void> {
    if (!authStore.userId) return;

    const { error } = await supabase
      .from('anime_list')
      .update({ current_episode: episode })
      .eq('id', id)
      .eq('user_id', authStore.userId);

    if (error) throw error;
  }

  async function updateStatus(id: string, status: AnimeStatus): Promise<void> {
    if (!authStore.userId) return;

    const { error } = await supabase
      .from('anime_list')
      .update({ status })
      .eq('id', id)
      .eq('user_id', authStore.userId);

    if (error) throw error;
  }

  async function deleteAnime(id: string): Promise<void> {
    if (!authStore.userId) return;

    const { error } = await supabase
      .from('anime_list')
      .delete()
      .eq('id', id)
      .eq('user_id', authStore.userId);

    if (error) throw error;
  }

  function mapDbToAnime(data: any): AnimeEntry {
    return {
      id: data.id,
      title: data.title,
      status: data.status,
      currentEpisode: data.current_episode,
      totalEpisodes: data.total_episodes,
      score: data.score,
      notes: data.notes,
      coverUrl: data.cover_url,
      startDate: data.start_date ? new Date(data.start_date) : null,
      endDate: data.end_date ? new Date(data.end_date) : null,
      rewatchCount: data.rewatch_count || 0,
    };
  }

  return {
    fetchAnimeList,
    fetchByStatus,
    addAnime,
    updateProgress,
    updateStatus,
    deleteAnime,
  };
}
```

---

## Componentes

### Ejemplo Completo: AnimeCard

```vue
<!-- app/components/anime/AnimeCard.vue -->
<script setup lang="ts">
import type { AnimeEntry } from '@/composables/useAnime';
import { useAnime } from '@/composables/useAnime';
import { useToast } from '@/composables/useToast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Play, Check, Trash2, ChevronUp, ChevronDown, Calendar, Star } from 'lucide-vue-next';

interface Props {
  anime: AnimeEntry;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  update: [];
  delete: [];
}>();

const animeApi = useAnime();
const toast = useToast();
const isLoading = ref(false);
const isExpanded = ref(false);

const progress = computed(() => {
  if (!props.anime.totalEpisodes) return 0;
  return (props.anime.currentEpisode / props.anime.totalEpisodes) * 100;
});

const isCompleted = computed(() => props.anime.status === 'completed');

async function incrementEpisode() {
  if (!props.anime.totalEpisodes || props.anime.currentEpisode >= props.anime.totalEpisodes) {
    return;
  }

  isLoading.value = true;
  try {
    await animeApi.updateProgress(props.anime.id, props.anime.currentEpisode + 1);
    emit('update');
    toast.success('Episodio actualizado');
  } catch (error) {
    toast.error('Error al actualizar');
  } finally {
    isLoading.value = false;
  }
}

async function decrementEpisode() {
  if (props.anime.currentEpisode <= 0) return;

  isLoading.value = true;
  try {
    await animeApi.updateProgress(props.anime.id, props.anime.currentEpisode - 1);
    emit('update');
    toast.success('Episodio actualizado');
  } catch (error) {
    toast.error('Error al actualizar');
  } finally {
    isLoading.value = false;
  }
}

async function handleDelete() {
  if (!confirm('¿Estás seguro de eliminar este anime?')) return;

  isLoading.value = true;
  try {
    await animeApi.deleteAnime(props.anime.id);
    emit('delete');
    toast.success('Anime eliminado');
  } catch (error) {
    toast.error('Error al eliminar');
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <Card>
    <CardHeader>
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <CardTitle class="flex items-center gap-2">
            <img
              v-if="anime.coverUrl"
              :src="anime.coverUrl"
              :alt="anime.title"
              class="w-12 h-16 object-cover rounded"
            />
            <span>{{ anime.title }}</span>
          </CardTitle>
        </div>
        <Button variant="ghost" size="icon" @click="handleDelete" :disabled="isLoading">
          <Trash2 class="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>

    <CardContent class="space-y-4">
      <div class="flex items-center gap-4">
        <Badge :variant="anime.status === 'completed' ? 'default' : 'secondary'">
          {{ anime.status }}
        </Badge>

        <div v-if="anime.score" class="flex items-center gap-1">
          <Star class="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span>{{ anime.score }}</span>
        </div>
      </div>

      <div v-if="isCompleted" class="flex items-center gap-2">
        <Check class="h-5 w-5 text-green-500" />
        <span class="text-sm text-muted-foreground">Completado</span>
      </div>

      <div v-else-if="anime.totalEpisodes" class="space-y-2">
        <div class="flex items-center justify-between text-sm">
          <span>Episodio {{ anime.currentEpisode }} / {{ anime.totalEpisodes }}</span>
          <span>{{ Math.round(progress) }}%</span>
        </div>
        <Progress :value="progress" />

        <div class="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                variant="outline"
                size="icon"
                @click="decrementEpisode"
                :disabled="isLoading || anime.currentEpisode <= 0"
              >
                <ChevronDown class="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Decrementar episodio</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                variant="outline"
                size="icon"
                @click="incrementEpisode"
                :disabled="isLoading || anime.currentEpisode >= anime.totalEpisodes"
              >
                <ChevronUp class="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Incrementar episodio</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div
        v-if="anime.startDate || anime.endDate"
        class="flex items-center gap-4 text-sm text-muted-foreground"
      >
        <div v-if="anime.startDate" class="flex items-center gap-1">
          <Calendar class="h-4 w-4" />
          <span>Inicio: {{ new Date(anime.startDate).toLocaleDateString() }}</span>
        </div>
        <div v-if="anime.endDate" class="flex items-center gap-1">
          <Calendar class="h-4 w-4" />
          <span>Fin: {{ new Date(anime.endDate).toLocaleDateString() }}</span>
        </div>
      </div>

      <Button variant="ghost" size="sm" @click="isExpanded = !isExpanded" class="w-full">
        {{ isExpanded ? 'Ocultar' : 'Mostrar' }} detalles
      </Button>

      <div v-if="isExpanded && anime.notes" class="text-sm text-muted-foreground">
        <p class="whitespace-pre-wrap">{{ anime.notes }}</p>
      </div>
    </CardContent>
  </Card>
</template>
```

---

## Páginas

### Ejemplo Completo: Página con Lista y Filtros

```vue
<!-- app/pages/anime.vue -->
<script setup lang="ts">
import { useAnime } from '@/composables/useAnime';
import { useToast } from '@/composables/useToast';
import type { AnimeEntry, AnimeStatus } from '@/composables/useAnime';
import AnimeStats from '@/components/anime/AnimeStats.vue';
import AnimeCard from '@/components/anime/AnimeCard.vue';
import AnimeCardSkeleton from '@/components/anime/AnimeCardSkeleton.vue';
import AnimeMarketplace from '@/components/anime/AnimeMarketplace.vue';
import AddAnimeStatusModal from '@/components/anime/AddAnimeStatusModal.vue';
import { Empty } from '@/components/ui/empty';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-vue-next';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

const route = useRoute();
const router = useRouter();

const animeApi = useAnime();
const toast = useToast();

const animes = ref<AnimeEntry[]>([]);
const isLoading = ref(false);
const showMarketplace = ref(false);
const showStatusModal = ref(false);
const selectedAnime = ref<any>(null);

const activeView = computed(() => {
  return (route.query.view as string) || 'list';
});

const activeFilter = computed(() => {
  return (route.query.filter as AnimeStatus) || 'all';
});

const filteredAnimes = computed(() => {
  if (activeFilter.value === 'all') return animes.value;
  return animes.value.filter((a) => a.status === activeFilter.value);
});

async function loadAnimes() {
  isLoading.value = true;
  try {
    animes.value = await animeApi.fetchAnimeList();
  } catch (error) {
    toast.error('Error al cargar animes');
  } finally {
    isLoading.value = false;
  }
}

function handleViewChange(view: string) {
  router.push({
    query: { ...route.query, view },
  });
}

function handleFilterChange(filter: AnimeStatus | 'all') {
  router.push({
    query: { ...route.query, filter },
  });
}

function handleAddFromMarketplace(anime: any) {
  selectedAnime.value = anime;
  showStatusModal.value = true;
}

function handleAnimeAdded() {
  showStatusModal.value = false;
  selectedAnime.value = null;
  loadAnimes();
}

function handleAnimeUpdate() {
  loadAnimes();
}

function handleAnimeDelete() {
  loadAnimes();
}

onMounted(() => {
  loadAnimes();
});
</script>

<template>
  <div class="container mx-auto py-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold">Anime</h1>

      <div class="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="outline" @click="showMarketplace = !showMarketplace">
              <Search class="h-4 w-4 mr-2" />
              Marketplace
            </Button>
          </TooltipTrigger>
          <TooltipContent>Buscar y añadir animes</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger as-child>
            <Button @click="showStatusModal = true">
              <Plus class="h-4 w-4 mr-2" />
              Añadir
            </Button>
          </TooltipTrigger>
          <TooltipContent>Añadir anime manualmente</TooltipContent>
        </Tooltip>
      </div>
    </div>

    <AnimeStats v-if="!isLoading" :animes="animes" />

    <Tabs :model-value="activeView" @update:model-value="handleViewChange">
      <TabsList>
        <TabsTrigger value="list">Lista</TabsTrigger>
        <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
      </TabsList>

      <TabsContent value="list" class="space-y-4">
        <Tabs :model-value="activeFilter" @update:model-value="handleFilterChange">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="watching">Viendo</TabsTrigger>
            <TabsTrigger value="completed">Completados</TabsTrigger>
            <TabsTrigger value="on_hold">En pausa</TabsTrigger>
            <TabsTrigger value="plan_to_watch">Planificados</TabsTrigger>
          </TabsList>
        </Tabs>

        <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimeCardSkeleton v-for="i in 6" :key="i" />
        </div>

        <Empty
          v-else-if="filteredAnimes.length === 0"
          title="No hay animes"
          description="Añade tu primer anime desde el marketplace o manualmente"
        />

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimeCard
            v-for="anime in filteredAnimes"
            :key="anime.id"
            :anime="anime"
            @update="handleAnimeUpdate"
            @delete="handleAnimeDelete"
          />
        </div>
      </TabsContent>

      <TabsContent value="marketplace">
        <AnimeMarketplace @add-anime="handleAddFromMarketplace" />
      </TabsContent>
    </Tabs>

    <AddAnimeStatusModal
      v-model:open="showStatusModal"
      :anime="selectedAnime"
      @add="handleAnimeAdded"
    />
  </div>
</template>
```

---

## Stores

### Ejemplo Completo: Store de Módulos

```typescript
// stores/modules.ts
import { defineStore } from 'pinia';
import type { ModuleId, AppModule } from '~~/domain/types';
import { ALL_MODULES } from '~~/domain/types/modules';

interface ModuleState {
  modules: Map<ModuleId, boolean>;
  synced: boolean;
}

export const useModulesStore = defineStore('modules', {
  state: (): ModuleState => ({
    modules: new Map(),
    synced: false,
  }),

  getters: {
    isEnabled: (state) => (moduleId: ModuleId) => {
      return state.modules.get(moduleId) ?? false;
    },

    enabledModules: (state): ModuleId[] => {
      return Array.from(state.modules.entries())
        .filter(([_, enabled]) => enabled)
        .map(([id]) => id);
    },

    hasCompletedOnboarding: (state): boolean => {
      return state.synced && state.modules.size > 0;
    },
  },

  actions: {
    setModule(moduleId: ModuleId, enabled: boolean) {
      this.modules.set(moduleId, enabled);
    },

    toggleModule(moduleId: ModuleId) {
      const current = this.modules.get(moduleId) ?? false;
      this.modules.set(moduleId, !current);
    },

    setModulesFromDb(data: Array<{ module_id: ModuleId; enabled: boolean }>) {
      data.forEach(({ module_id, enabled }) => {
        this.modules.set(module_id, enabled);
      });
      this.synced = true;
    },

    reset() {
      this.modules.clear();
      this.synced = false;
    },
  },
});
```

---

## Utilidades

### Ejemplo: Formateo de Fechas

```typescript
// app/utils/date-formatters.ts
import { format, formatDistance, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd/MM/yyyy', { locale: es });
}

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: es });
}

export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isToday(dateObj)) {
    return 'Hoy';
  }

  if (isYesterday(dateObj)) {
    return 'Ayer';
  }

  return formatDistance(dateObj, new Date(), {
    addSuffix: true,
    locale: es,
  });
}
```

---

**Última actualización**: Enero 2025
