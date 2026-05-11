<script setup lang="ts">
import AddAnimeStatusModal from '@/components/anime/AddAnimeStatusModal.vue'
import AnimeCard from '@/components/anime/AnimeCard.vue'
import AnimeCardSkeleton from '@/components/anime/AnimeCardSkeleton.vue'
import AnimeMarketplace from '@/components/anime/AnimeMarketplace.vue'
import AnimeStats from '@/components/anime/AnimeStats.vue'
import AnimeStatsSkeleton from '@/components/anime/AnimeStatsSkeleton.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { AnimeStatus } from '@/composables/useAnime'
import { useAnimePage } from '@/composables/useAnimePage'
import { BookOpen, CheckCircle2, List, Pause, Play, Plus, Repeat, Search, Tv, X, XCircle } from 'lucide-vue-next'

const {
  animeList,
  loading,
  modal,
  statusModal,
  activeView,
  activeTab,
  selectedAnimeForAdd,
  addingAnime,
  newAnime,
  filteredAnime,
  stats,
  setActiveView,
  updateSearchQuery,
  handleAddAnimeClick,
  addAnimeFromSearch,
  addAnime,
  incrementEpisode,
  decrementEpisode,
  deleteAnimeEntry,
} = useAnimePage()

const CloseIcon = X

const statusConfig: Record<AnimeStatus, { icon: any, color: string, label: string }> = {
  watching: { icon: Play, color: 'text-primary', label: 'En curso' },
  completed: { icon: CheckCircle2, color: 'text-exp-easy', label: 'Visto' },
  on_hold: { icon: Pause, color: 'text-exp-medium', label: 'En pausa' },
  dropped: { icon: XCircle, color: 'text-destructive', label: 'Droppeado' },
  plan_to_watch: { icon: Tv, color: 'text-muted-foreground', label: 'Pendiente' },
  rewatching: { icon: Repeat, color: 'text-accent', label: 'Reviendo' }
}

const tabs: Array<{ value: 'all' | AnimeStatus; label: string; icon: any }> = [
  { value: 'all', label: 'Todos', icon: List },
  { value: 'watching', label: 'En curso', icon: Play },
  { value: 'completed', label: 'Visto', icon: CheckCircle2 },
  { value: 'plan_to_watch', label: 'Pendiente', icon: Tv },
  { value: 'on_hold', label: 'En pausa', icon: Pause },
]
</script>

<template>
  <div class="space-y-4 sm:space-y-6">
    <header class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Tv class="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          Anime
        </h1>
        <p class="text-muted-foreground text-xs sm:text-sm mt-0.5">
          Gestiona tu lista de animes
        </p>
      </div>
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="outline" size="lg" class="flex-1 sm:flex-none"
              @click="setActiveView(activeView === 'list' ? 'marketplace' : 'list')">
              <Search v-if="activeView === 'list'" class="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <BookOpen v-else class="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span class="sm:hidden">{{ activeView === 'list' ? 'Buscar' : 'Mi Lista' }}</span>
              <span class="hidden sm:inline">{{ activeView === 'list' ? 'Buscar Animes' : 'Mi Lista' }}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{{ activeView === 'list' ? 'Buscar animes en el marketplace' : 'Ver mi lista de animes' }}</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip v-if="activeView === 'list'">
          <TooltipTrigger as-child>
            <Button size="lg" class="flex-1 sm:flex-none sm:h-10 sm:w-auto rounded-full glow-primary"
              @click="modal.open()">
              <Plus class="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span class="sm:hidden">Añadir</span>
              <span class="hidden sm:inline">Añadir Manual</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Añadir anime manualmente</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </header>

    <div v-if="activeView === 'marketplace'" data-marketplace class="w-full">
      <AnimeMarketplace :adding="addingAnime" @add="handleAddAnimeClick" @search="updateSearchQuery" />
    </div>

    <div v-else class="space-y-4 sm:space-y-6">
      <AnimeStatsSkeleton v-if="loading" />
      <AnimeStats v-else :watching="stats.watching" :completed="stats.completed" :total="stats.total" />

      <div class="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <Button v-for="tab in tabs" :key="tab.value" :variant="activeTab === tab.value ? 'default' : 'outline'"
          size="sm" class="shrink-0" @click="activeTab = tab.value">
          <component :is="tab.icon" class="h-4 w-4 mr-1" />
          {{ tab.label }}
        </Button>
      </div>

      <section class="space-y-3">
        <template v-if="loading">
          <AnimeCardSkeleton v-for="i in 3" :key="i" />
        </template>

        <Empty v-else-if="filteredAnime.length === 0" title="No hay animes en esta categoría"
          description="Añade animes desde el marketplace o manualmente">
          <template #icon>
            <Tv class="h-12 w-12 text-primary/50" />
          </template>
          <template #action>
            <div class="flex gap-2">
              <Button variant="outline" size="lg" @click="setActiveView('marketplace')">
                <Search class="h-4 w-4 mr-2" />
                Buscar Animes
              </Button>
              <Button variant="outline" size="lg" @click="modal.open()">
                <Plus class="h-4 w-4 mr-2" />
                Añadir Manual
              </Button>
            </div>
          </template>
        </Empty>

        <div v-else class="space-y-2 sm:space-y-3">
          <AnimeCard v-for="anime in filteredAnime" :key="anime.id" :anime="anime" @increment="incrementEpisode"
            @decrement="decrementEpisode" @delete="deleteAnimeEntry" />
        </div>
      </section>
    </div>

    <ClientOnly>
      <Teleport to="body">
        <Transition name="modal">
          <div v-if="modal.isOpen.value"
            class="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-4 bg-background/95 backdrop-blur-sm overflow-y-auto"
            style="pointer-events: auto;" @click.self="modal.close()">
            <Card class="w-full max-w-md my-auto shadow-xl border-2" @click.stop>
              <CardHeader class="flex flex-row items-center justify-between pb-3 sm:pb-4 border-b">
                <CardTitle class="text-lg sm:text-xl">Añadir Anime Manualmente</CardTitle>
                <Button variant="ghost" size="icon"
                  class="h-8 w-8 sm:h-9 sm:w-9 hover:bg-muted hover:text-foreground cursor-pointer"
                  @click="modal.close()">
                  <CloseIcon class="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent class="space-y-4 pt-4 sm:pt-6">
                <div class="space-y-2">
                  <Label for="title" class="text-sm font-medium">Título</Label>
                  <Input id="title" v-model="newAnime.title" placeholder="Ej: One Piece" class="w-full h-11 text-base"
                    autofocus />
                </div>
                <div class="space-y-2">
                  <Label for="episodes" class="text-sm font-medium">Episodios totales (opcional)</Label>
                  <Input id="episodes" v-model.number="newAnime.total_episodes" type="number" placeholder="24"
                    class="w-full h-11 text-base" />
                </div>
                <div class="space-y-2">
                  <Label class="text-sm font-medium">Estado</Label>
                  <div class="grid grid-cols-2 gap-2">
                    <Button v-for="(config, status) in statusConfig" :key="status"
                      :variant="newAnime.status === status ? 'default' : 'outline'" size="sm" class="text-xs"
                      @click="newAnime.status = status as AnimeStatus">
                      {{ config.label }}
                    </Button>
                  </div>
                </div>
                <Button size="lg" class="w-full h-12 text-base font-semibold mt-2" @click="addAnime"
                  :disabled="!newAnime.title.trim()">
                  <Plus class="h-5 w-5 mr-2" />
                  Añadir Anime
                </Button>
              </CardContent>
            </Card>
          </div>
        </Transition>
      </Teleport>
    </ClientOnly>

    <AddAnimeStatusModal :anime="selectedAnimeForAdd" :open="statusModal.isOpen.value" @close="statusModal.close()"
      @confirm="addAnimeFromSearch" />
  </div>
</template>
