<script setup lang="ts">
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, LayoutGrid, List, User } from 'lucide-vue-next';
import type { PartySharedList } from '~~/domain/types/party';

const props = defineProps<{
  lists: PartySharedList[]
}>()

const emit = defineEmits<{
  (e: 'select', list: PartySharedList): void
}>()

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString()
}
</script>

<template>
  <div v-if="lists.length === 0" class="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20"
    role="status" aria-live="polite">
    <LayoutGrid class="h-12 w-12 mx-auto text-muted-foreground mb-3" aria-hidden="true" />
    <h3 class="text-lg font-medium mb-2">No hay listas compartidas</h3>
    <p class="text-muted-foreground text-sm">Crea una lista para empezar a colaborar</p>
  </div>

  <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list"
    aria-label="Listas compartidas de la party">
    <Card v-for="list in lists" :key="list.id"
      class="cursor-pointer hover:border-primary transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 group focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background"
      role="listitem" tabindex="0" @click="emit('select', list)"
      @keydown.enter="emit('select', list)" @keydown.space.prevent="emit('select', list)"
      :aria-label="`Lista: ${list.name}, tipo: ${list.listType === 'anime' ? 'Anime List' : 'Tier List'}`">
      <CardHeader class="space-y-3">
        <div class="flex justify-between items-start">
          <div
            class="p-2.5 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200 group-hover:scale-110"
            role="img" :aria-label="list.listType === 'anime' ? 'Lista de anime' : 'Tier list'">
            <List v-if="list.listType === 'anime'" class="h-5 w-5" aria-hidden="true" />
            <LayoutGrid v-else-if="list.listType === 'tier_list'" class="h-5 w-5" aria-hidden="true" />
            <span v-else class="h-5 w-5 block" aria-hidden="true" />
          </div>
        </div>
        <div>
          <CardTitle class="text-base sm:text-lg group-hover:text-primary transition-colors">
            {{ list.name }}
          </CardTitle>
          <CardDescription class="text-sm mt-1">
            {{ list.listType === 'anime' ? 'Lista de Anime Compartida' : 'Tier List Colaborativa' }}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="flex items-center gap-4 text-sm text-muted-foreground flex-wrap" role="group"
          aria-label="Información de la lista">
          <div class="flex items-center gap-1.5" role="status">
            <Clock class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span class="text-xs">{{ formatDate(list.createdAt) }}</span>
          </div>
          <div class="flex items-center gap-1.5" v-if="list.creator" role="status">
            <User class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span class="text-xs truncate">{{ list.creator.displayName || list.creator.username }}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter class="pt-3 border-t bg-muted/20">
        <div class="text-xs text-muted-foreground w-full flex justify-between items-center">
          <span v-if="list._count" role="status">
            <span class="font-medium text-foreground">{{ list._count.animeItems ?? 0 }}</span> items
          </span>
          <span v-else class="text-primary group-hover:underline">Ver contenido</span>
        </div>
      </CardFooter>
    </Card>
  </div>
</template>
