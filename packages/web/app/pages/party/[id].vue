<script setup lang="ts">
import CreateListModal from '@/components/party/lists/CreateListModal.vue'; // To create
import PartyAnimeList from '@/components/party/lists/PartyAnimeList.vue'; // To create
import SharedListsOverview from '@/components/party/lists/SharedListsOverview.vue'; // To create
import TierListEditor from '@/components/party/lists/TierListEditor.vue'; // To create
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useParties } from '@/composables/useParties';
import { usePartyLists } from '@/composables/usePartyLists';
import { ArrowLeft, Layers, Plus, Users } from 'lucide-vue-next';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Party, PartySharedList, SharedListType } from '~~/domain/types/party';

const route = useRoute();
const router = useRouter();
const partyId = route.params.id as string;

const { fetchPartyById } = useParties();
const { lists, fetchLists, createList } = usePartyLists(partyId);

const party = ref<Party | null>(null);
const loading = ref(true);
const activeTab = ref('lists');
const selectedList = ref<PartySharedList | null>(null);
const isCreateListOpen = ref(false);

onMounted(async () => {
  loading.value = true;
  try {
    const p = await fetchPartyById(partyId);
    if (!p) {
      router.push('/party');
      return;
    }
    party.value = p;
    await fetchLists();
  } finally {
    loading.value = false;
  }
});

function handleListSelect(list: PartySharedList) {
  selectedList.value = list;
}

function handleBackToLists() {
  selectedList.value = null;
  fetchLists(); // Refresh to update counts/metadata if changed
}

async function handleCreateList(data: { name: string; type: SharedListType }) {
  await createList(data.name, data.type);
  isCreateListOpen.value = false;
}
</script>

<template>
  <div class="space-y-6" role="main">
    <!-- Header -->
    <header v-if="party" class="flex flex-col gap-4" role="banner">
      <div class="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          class="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 rounded-none cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Volver a la lista de parties"
          @click="router.push('/party')"
        >
          <ArrowLeft class="h-5 w-5" aria-hidden="true" />
        </Button>
        <div class="flex-1 min-w-0">
          <p
            class="flex items-center gap-1 font-pixel text-[8px] text-secondary/80 uppercase tracking-wider mb-0.5"
          >
            <span class="text-secondary">▸</span> PARTY
          </p>
          <h1 class="text-xl sm:text-2xl font-bold truncate">{{ party.name }}</h1>
        </div>
      </div>

      <!-- Stats strip -->
      <div
        class="flex flex-wrap items-center gap-3 sm:gap-4 font-pixel text-[8px] text-muted-foreground"
        role="group"
        aria-label="Información de la party"
      >
        <div class="flex items-center gap-1.5" role="status">
          <Users class="h-3.5 w-3.5 shrink-0 text-secondary/70" aria-hidden="true" />
          <span class="text-secondary/80">{{ party.members.length }}</span>
          <span>/ {{ party.maxMembers }} MIEMBROS</span>
        </div>
        <div
          class="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-muted border border-border/50"
          role="group"
          aria-label="Código de invitación"
        >
          <code
            class="font-mono text-xs sm:text-sm select-all text-secondary"
            :aria-label="`Código: ${party.inviteCode}`"
          >
            {{ party.inviteCode }}
          </code>
        </div>
      </div>
    </header>

    <!-- Content -->
    <div
      v-if="loading"
      class="py-12 flex flex-col items-center justify-center gap-3"
      role="status"
      aria-live="polite"
      aria-label="Cargando detalles de la party"
    >
      <div
        class="h-8 w-8 border-2 border-secondary border-t-transparent motion-safe:animate-spin"
        aria-hidden="true"
      />
      <p class="font-pixel text-[9px] text-muted-foreground uppercase tracking-wider">CARGANDO…</p>
    </div>

    <Tabs v-else v-model="activeTab" class="w-full">
      <TabsList class="grid w-full grid-cols-2" role="tablist" aria-label="Secciones de la party">
        <TabsTrigger
          value="lists"
          class="flex items-center gap-2"
          role="tab"
          aria-controls="lists-panel"
          aria-selected="activeTab === 'lists'"
        >
          <Layers class="h-4 w-4 shrink-0" aria-hidden="true" />
          <span class="hidden sm:inline">Listas Compartidas</span>
          <span class="sm:hidden">Listas</span>
        </TabsTrigger>
        <TabsTrigger
          value="members"
          class="flex items-center gap-2"
          role="tab"
          aria-controls="members-panel"
          aria-selected="activeTab === 'members'"
        >
          <Users class="h-4 w-4 shrink-0" aria-hidden="true" />
          <span class="hidden sm:inline">Miembros</span>
          <span class="sm:hidden">Miembros</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent
        id="lists-panel"
        value="lists"
        class="space-y-4 mt-6"
        role="tabpanel"
        aria-labelledby="lists-tab"
      >
        <div
          class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4"
        >
          <div>
            <p
              class="flex items-center gap-1 font-pixel text-[8px] text-secondary/80 uppercase tracking-wider mb-0.5"
            >
              <span class="text-secondary">▸</span> LISTAS COMPARTIDAS
            </p>
            <h3 class="text-base sm:text-lg font-bold">Listas de la Party</h3>
          </div>
          <Button
            class="btn-game min-h-[44px] sm:min-h-0 w-full sm:w-auto rounded-none font-pixel text-[9px] cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Crear nueva lista compartida"
            @click="isCreateListOpen = true"
          >
            <Plus class="h-4 w-4 mr-2" aria-hidden="true" />
            NUEVA LISTA
          </Button>
        </div>

        <SharedListsOverview :lists="lists" @select="handleListSelect" />
      </TabsContent>

      <TabsContent
        id="members-panel"
        value="members"
        class="mt-6"
        role="tabpanel"
        aria-labelledby="members-tab"
      >
        <div v-if="party" class="space-y-3 sm:space-y-4">
          <div>
            <p
              class="flex items-center gap-1 font-pixel text-[8px] text-secondary/80 uppercase tracking-wider mb-0.5"
            >
              <span class="text-secondary">▸</span> MIEMBROS
            </p>
            <h3 class="text-base sm:text-lg font-bold">Miembros de la Party</h3>
            <p class="font-pixel text-[8px] text-muted-foreground/70 mt-0.5">
              {{ party.members.length }} / {{ party.maxMembers }} SLOTS
            </p>
          </div>
          <div
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
            role="list"
            aria-label="Lista de miembros"
          >
            <Card
              v-for="member in party.members"
              :key="member.id"
              role="listitem"
              class="relative rounded-none border-2 border-secondary/20 hover:border-secondary/40 bg-card/60 transition-colors"
            >
              <!-- HUD corner brackets -->
              <span
                class="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-secondary/35"
                aria-hidden="true"
              />
              <span
                class="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-secondary/35"
                aria-hidden="true"
              />
              <span
                class="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-secondary/35"
                aria-hidden="true"
              />
              <span
                class="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-secondary/35"
                aria-hidden="true"
              />
              <CardHeader class="flex flex-row items-center gap-3 sm:gap-4 space-y-0">
                <div
                  class="h-10 w-10 sm:h-12 sm:w-12 bg-secondary/15 flex items-center justify-center overflow-hidden border-2 border-secondary/25 shrink-0"
                  style="
                    clip-path: polygon(
                      0 4px,
                      4px 4px,
                      4px 0,
                      calc(100% - 4px) 0,
                      calc(100% - 4px) 4px,
                      100% 4px,
                      100% calc(100% - 4px),
                      calc(100% - 4px) calc(100% - 4px),
                      calc(100% - 4px) 100%,
                      4px 100%,
                      4px calc(100% - 4px),
                      0 calc(100% - 4px)
                    );
                  "
                  role="img"
                  :aria-label="`Avatar de ${member.profile?.displayName || member.profile?.username}`"
                >
                  <img
                    v-if="member.profile?.avatarUrl"
                    :src="member.profile.avatarUrl"
                    :alt="member.profile?.displayName || member.profile?.username"
                    class="h-full w-full object-cover"
                  />
                  <span v-else class="text-base sm:text-lg font-bold text-secondary">
                    {{ (member.profile?.username || '?').charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div class="flex-1 min-w-0">
                  <CardTitle class="text-sm sm:text-base truncate">
                    {{ member.profile?.displayName || member.profile?.username || 'Usuario' }}
                  </CardTitle>
                  <CardDescription class="font-pixel text-[8px] uppercase tracking-wider">
                    {{
                      member.role === 'owner'
                        ? 'DUEÑO'
                        : member.role === 'admin'
                          ? 'ADMIN'
                          : 'MIEMBRO'
                    }}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </TabsContent>
    </Tabs>

    <!-- List Detail Modal -->
    <Dialog :open="!!selectedList" @update:open="(val) => !val && handleBackToLists()">
      <DialogContent
        v-if="selectedList"
        class="max-w-[95vw] w-full h-[90vh] flex flex-col p-0 gap-0 overflow-hidden sm:max-w-7xl"
        role="dialog"
        aria-modal="true"
      >
        <DialogHeader class="px-4 sm:px-6 py-4 border-b shrink-0 sticky top-0 bg-background z-10">
          <DialogTitle
            :id="`list-${selectedList.id}-title`"
            class="truncate text-lg sm:text-xl font-semibold flex items-center gap-2 flex-wrap"
          >
            {{ selectedList.name }}
            <Badge
              :variant="selectedList.listType === 'anime' ? 'default' : 'secondary'"
              class="text-xs font-medium shrink-0"
            >
              {{ selectedList.listType === 'anime' ? 'Anime List' : 'Tier List' }}
            </Badge>
          </DialogTitle>
          <DialogDescription class="text-sm mt-1.5">
            {{
              selectedList.listType === 'anime'
                ? 'Gestiona y visualiza animes compartidos'
                : 'Edita y vota en la tier list colaborativa'
            }}
          </DialogDescription>
        </DialogHeader>

        <div
          class="flex-1 overflow-y-auto p-4 sm:p-6"
          role="main"
          :aria-labelledby="`list-${selectedList.id}-title`"
        >
          <PartyAnimeList
            v-if="selectedList.listType === 'anime'"
            :list="selectedList"
            :party-id="partyId"
          />
          <TierListEditor
            v-else-if="selectedList.listType === 'tier_list'"
            :list="selectedList"
            :party-id="partyId"
          />
          <div v-else class="text-center py-10 text-muted-foreground" role="status">
            Tipo de lista no soportado aún
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <CreateListModal
      :open="isCreateListOpen"
      @close="isCreateListOpen = false"
      @submit="handleCreateList"
    />
  </div>
</template>
