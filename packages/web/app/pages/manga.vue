<script setup lang="ts">
import { BookOpen, Plus, CheckCircle2, Heart, TrendingUp, List } from 'lucide-vue-next';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import MangaStats from '@/components/manga/MangaStats.vue';
import MangaStatsSkeleton from '@/components/manga/MangaStatsSkeleton.vue';
import MangaList from '@/components/manga/MangaList.vue';
import AddMangaModal from '@/components/manga/AddMangaModal.vue';
import { ErrorState } from '@/components/error';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useMangaPage } from '@/composables/useMangaPage';

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
} = useMangaPage();

useSeoMeta({
  title: 'Tu colección de manga',
  description: 'Gestiona tu colección de manga en FreakDays',
});

const tabs = [
  { value: 'all' as const, label: 'Todos', icon: List },
  { value: 'collecting' as const, label: 'En curso', icon: TrendingUp },
  { value: 'completed' as const, label: 'Completadas', icon: CheckCircle2 },
  { value: 'wishlist' as const, label: 'Wishlist', icon: Heart },
];
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <header class="flex items-center justify-between">
      <div>
        <p
          class="flex items-center gap-1.5 font-pixel text-[9px] text-muted-foreground/80 uppercase mb-1"
        >
          <span class="text-secondary">▸</span> MANGA
        </p>
        <h1 class="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <BookOpen class="h-6 w-6 text-secondary" aria-hidden="true" />
          Colección Manga
        </h1>
        <p class="font-pixel text-[9px] text-muted-foreground/70 mt-1 uppercase">
          BIBLIOTECA FÍSICA · RASTREA TOMOS
        </p>
      </div>
      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            size="lg"
            class="btn-game rounded-none font-pixel text-[10px] uppercase shadow-[0_5px_0_0_oklch(0.30_0.12_145)] hover:shadow-[0_5px_0_0_oklch(0.40_0.15_145)] hover:brightness-105 active:translate-y-[4px] active:shadow-[0_1px_0_0_oklch(0.30_0.12_145)] transition-[transform,filter,box-shadow,border-color] duration-100 motion-reduce:active:translate-y-0 cursor-pointer"
            :aria-label="'Añadir manga'"
            @click="modal.open()"
          >
            <Plus class="h-5 w-5 mr-2" aria-hidden="true" />
            <span class="hidden sm:inline">AÑADIR</span>
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
      <TabsList class="grid w-full grid-cols-4 rounded-none border-2">
        <TabsTrigger
          v-for="tab in tabs"
          :key="tab.value"
          :value="tab.value"
          class="rounded-none flex items-center gap-2 font-pixel text-[8px] uppercase"
        >
          <component :is="tab.icon" class="h-4 w-4" aria-hidden="true" />
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

    <AddMangaModal :show="modal.isOpen.value" @close="modal.close()" @submit="addManga" />
  </div>
</template>
