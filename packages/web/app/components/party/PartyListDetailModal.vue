<script setup lang="ts">
import PartyAnimeList from '@/components/party/lists/PartyAnimeList.vue';
import TierListEditor from '@/components/party/lists/TierListEditor.vue';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { PartySharedList } from '~~/domain/types/party';

interface Props {
  open: boolean;
  list: PartySharedList | null;
  partyId: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  close: [];
}>();
</script>

<template>
  <Dialog :open="open" @update:open="(val) => emit('update:open', val)">
    <DialogContent class="max-w-[95vw] w-full h-[90vh] flex flex-col p-0 gap-0 overflow-hidden sm:max-w-7xl">
      <DialogHeader class="px-6 py-4 border-b shrink-0">
        <div class="flex items-center gap-2">
          <DialogTitle>{{ list?.name }}</DialogTitle>
          <span v-if="list" class="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
            {{ list.listType === 'anime' ? 'Anime List' : 'Tier List' }}
          </span>
        </div>
        <DialogDescription>
          {{ list?.listType === 'anime' ? 'Gestiona y visualiza animes compartidos' : 'Edita y vota en la tier list colaborativa' }}
        </DialogDescription>
      </DialogHeader>

      <div class="flex-1 overflow-y-auto p-6" v-if="list">
        <PartyAnimeList v-if="list.listType === 'anime'" :list="list" :party-id="partyId" />
        <TierListEditor v-else-if="list.listType === 'tier_list'" :list="list" :party-id="partyId" />
        <div v-else class="text-center py-10">
          Tipo de lista no soportado aún
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
