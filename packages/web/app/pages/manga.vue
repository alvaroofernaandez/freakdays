<script setup lang="ts">
import { BookOpen, Plus, CheckCircle2, Heart, TrendingUp, List } from 'lucide-vue-next'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import MangaStats from '@/components/manga/MangaStats.vue'
import MangaStatsSkeleton from '@/components/manga/MangaStatsSkeleton.vue'
import MangaList from '@/components/manga/MangaList.vue'
import AddMangaModal from '@/components/manga/AddMangaModal.vue'
import { ErrorState } from '@/components/error'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { useMangaPage } from '@/composables/useMangaPage'

const {
  mangaCollection,
  loading,
  error,
  modal,
  activeTab,
  filteredMangas,
  addManga,
  handleAddVolume,
  handleRemoveVolume,
  handleDelete,
  handleUpdatePrice,
  handleUpdateStatus,
  reloadManga,
} = useMangaPage()

const tabs = [
  { value: 'all' as const, label: 'Todos', icon: List },
  { value: 'collecting' as const, label: 'En curso', icon: TrendingUp },
  { value: 'completed' as const, label: 'Completadas', icon: CheckCircle2 },
  { value: 'wishlist' as const, label: 'Wishlist', icon: Heart },
]
</script>

<template>
  <div class="space-y-6">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <BookOpen class="h-6 w-6 text-primary" />
          Colección Manga
        </h1>
        <p class="text-muted-foreground text-sm">
          Gestiona tu biblioteca física de mangas
        </p>
      </div>
      <Tooltip>
        <TooltipTrigger as-child>
          <Button size="icon" class="h-10 w-10 rounded-full glow-primary" @click="modal.open()">
            <Plus class="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Añadir manga</p>
        </TooltipContent>
      </Tooltip>
    </header>

    <MangaStatsSkeleton v-if="loading" />
    <ErrorState 
      v-else-if="error"
      :message="error.message"
      action-label="Reintentar"
      @action="reloadManga"
    />
    <MangaStats v-else :mangas="mangaCollection" />

    <Tabs v-model="activeTab" class="w-full">
      <TabsList class="grid w-full grid-cols-4">
        <TabsTrigger 
          v-for="tab in tabs" 
          :key="tab.value" 
          :value="tab.value"
          class="flex items-center gap-2"
        >
          <component :is="tab.icon" class="h-4 w-4" />
          <span class="hidden sm:inline">{{ tab.label }}</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all" class="mt-4">
        <MangaList
          :mangas="filteredMangas"
          :loading="loading"
          @add-volume="handleAddVolume"
          @remove-volume="handleRemoveVolume"
          @delete="handleDelete"
          @update-price="handleUpdatePrice"
          @update-status="handleUpdateStatus"
        />
      </TabsContent>

      <TabsContent value="collecting" class="mt-4">
        <MangaList
          :mangas="filteredMangas"
          :loading="loading"
          @add-volume="handleAddVolume"
          @remove-volume="handleRemoveVolume"
          @delete="handleDelete"
          @update-price="handleUpdatePrice"
          @update-status="handleUpdateStatus"
        />
      </TabsContent>

      <TabsContent value="completed" class="mt-4">
        <MangaList
          :mangas="filteredMangas"
          :loading="loading"
          @add-volume="handleAddVolume"
          @remove-volume="handleRemoveVolume"
          @delete="handleDelete"
          @update-price="handleUpdatePrice"
          @update-status="handleUpdateStatus"
        />
      </TabsContent>

      <TabsContent value="wishlist" class="mt-4">
        <MangaList
          :mangas="filteredMangas"
          :loading="loading"
          @add-volume="handleAddVolume"
          @remove-volume="handleRemoveVolume"
          @delete="handleDelete"
          @update-price="handleUpdatePrice"
          @update-status="handleUpdateStatus"
        />
      </TabsContent>
    </Tabs>

    <AddMangaModal 
      :show="modal.isOpen.value" 
      @close="modal.close()"
      @submit="addManga"
    />
  </div>
</template>
