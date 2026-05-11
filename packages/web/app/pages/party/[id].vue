<script setup lang="ts">
import CreateListModal from '@/components/party/lists/CreateListModal.vue'; // To create
import PartyAnimeList from '@/components/party/lists/PartyAnimeList.vue'; // To create
import SharedListsOverview from '@/components/party/lists/SharedListsOverview.vue'; // To create
import TierListEditor from '@/components/party/lists/TierListEditor.vue'; // To create
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useParties } from '@/composables/useParties';
import { usePartyLists } from '@/composables/usePartyLists';
import { ArrowLeft, Layers, Plus, Users } from 'lucide-vue-next';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { PartySharedList } from '~~/domain/types/party';

const route = useRoute()
const router = useRouter()
const partyId = route.params.id as string

const { fetchPartyById } = useParties()
const { lists, fetchLists, createList } = usePartyLists(partyId)

const party = ref<any>(null)
const loading = ref(true)
const activeTab = ref('lists')
const selectedList = ref<PartySharedList | null>(null)
const isCreateListOpen = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const p = await fetchPartyById(partyId)
    if (!p) {
      router.push('/party')
      return
    }
    party.value = p
    await fetchLists()
  } finally {
    loading.value = false
  }
})

function handleListSelect(list: PartySharedList) {
  selectedList.value = list
}

function handleBackToLists() {
  selectedList.value = null
  fetchLists() // Refresh to update counts/metadata if changed
}

async function handleCreateList(data: { name: string, type: any }) {
  await createList(data.name, data.type)
  isCreateListOpen.value = false
}
</script>

<template>
  <div class="space-y-6" role="main">
    <!-- Header -->
    <header class="flex flex-col gap-4" v-if="party" role="banner">
      <div class="flex items-center gap-2">
        <Button variant="ghost" size="icon" class="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
          @click="router.push('/party')" aria-label="Volver a la lista de parties">
          <ArrowLeft class="h-5 w-5" aria-hidden="true" />
        </Button>
        <div class="flex-1 min-w-0">
          <h1 class="text-xl sm:text-2xl font-bold truncate">{{ party.name }}</h1>
          <p class="text-sm sm:text-base text-muted-foreground truncate">
            {{ party.description || 'Sin descripción' }}
          </p>
        </div>
      </div>

      <!-- Copy Code / Stats -->
      <div class="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-muted-foreground" role="group"
        aria-label="Información de la party">
        <div class="flex items-center gap-1.5" role="status">
          <Users class="h-4 w-4 shrink-0" aria-hidden="true" />
          <span class="font-medium">{{ party.members.length }}</span>
          <span>/ {{ party.maxMembers }} miembros</span>
        </div>
        <div class="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-muted rounded-md border border-border/50"
          role="group" aria-label="Código de invitación">
          <code class="font-mono text-xs sm:text-sm select-all" aria-label="Código: {{ party.inviteCode }}">
            {{ party.inviteCode }}
          </code>
        </div>
      </div>
    </header>

    <!-- Content -->
    <div v-if="loading" class="py-12 flex flex-col items-center justify-center gap-3" role="status" aria-live="polite"
      aria-label="Cargando detalles de la party">
      <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" role="status"
        aria-label="Cargando"></div>
      <p class="text-muted-foreground text-sm">Cargando detalles...</p>
    </div>

    <Tabs v-else v-model="activeTab" class="w-full">
      <TabsList class="grid w-full grid-cols-2" role="tablist" aria-label="Secciones de la party">
        <TabsTrigger value="lists" class="flex items-center gap-2" role="tab" aria-controls="lists-panel"
          aria-selected="activeTab === 'lists'">
          <Layers class="h-4 w-4 shrink-0" aria-hidden="true" />
          <span class="hidden sm:inline">Listas Compartidas</span>
          <span class="sm:hidden">Listas</span>
        </TabsTrigger>
        <TabsTrigger value="members" class="flex items-center gap-2" role="tab" aria-controls="members-panel"
          aria-selected="activeTab === 'members'">
          <Users class="h-4 w-4 shrink-0" aria-hidden="true" />
          <span class="hidden sm:inline">Miembros</span>
          <span class="sm:hidden">Miembros</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="lists" id="lists-panel" class="space-y-4 mt-6" role="tabpanel" aria-labelledby="lists-tab">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div>
            <h3 class="text-lg sm:text-xl font-semibold">Listas de la Party</h3>
            <p class="text-sm text-muted-foreground mt-1">
              Gestiona las listas compartidas con tu party
            </p>
          </div>
          <Button @click="isCreateListOpen = true" class="min-h-[44px] sm:min-h-0 w-full sm:w-auto"
            aria-label="Crear nueva lista compartida">
            <Plus class="h-4 w-4 mr-2" aria-hidden="true" />
            Nueva Lista
          </Button>
        </div>

        <SharedListsOverview :lists="lists" @select="handleListSelect" />
      </TabsContent>

      <TabsContent value="members" id="members-panel" class="mt-6" role="tabpanel" aria-labelledby="members-tab">
        <div class="space-y-3 sm:space-y-4">
          <div>
            <h3 class="text-lg sm:text-xl font-semibold">Miembros de la Party</h3>
            <p class="text-sm text-muted-foreground mt-1">
              {{ party.members.length }} de {{ party.maxMembers }} miembros
            </p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4" role="list"
            aria-label="Lista de miembros">
            <Card v-for="member in party.members" :key="member.id" role="listitem"
              class="hover:border-primary/40 transition-colors">
              <CardHeader class="flex flex-row items-center gap-3 sm:gap-4 space-y-0">
                <div
                  class="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border shrink-0"
                  role="img" :aria-label="`Avatar de ${member.profile?.displayName || member.profile?.username}`">
                  <img v-if="member.profile?.avatarUrl" :src="member.profile.avatarUrl"
                    :alt="member.profile?.displayName || member.profile?.username" class="h-full w-full object-cover" />
                  <span v-else class="text-base sm:text-lg font-bold">
                    {{ (member.profile?.username || '?').charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div class="flex-1 min-w-0">
                  <CardTitle class="text-base sm:text-lg truncate">
                    {{ member.profile?.displayName || member.profile?.username || 'Usuario' }}
                  </CardTitle>
                  <CardDescription class="capitalize text-sm">
                    {{ member.role === 'owner' ? 'Dueño' : member.role === 'admin' ? 'Admin' : 'Miembro' }}
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
      <DialogContent v-if="selectedList"
        class="max-w-[95vw] w-full h-[90vh] flex flex-col p-0 gap-0 overflow-hidden sm:max-w-7xl" role="dialog"
        aria-modal="true">
        <DialogHeader class="px-4 sm:px-6 py-4 border-b shrink-0 sticky top-0 bg-background z-10">
          <DialogTitle :id="`list-${selectedList.id}-title`"
            class="truncate text-lg sm:text-xl font-semibold flex items-center gap-2 flex-wrap">
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

        <div class="flex-1 overflow-y-auto p-4 sm:p-6" role="main" :aria-labelledby="`list-${selectedList.id}-title`">
          <PartyAnimeList v-if="selectedList.listType === 'anime'" :list="selectedList" :party-id="partyId" />
          <TierListEditor v-else-if="selectedList.listType === 'tier_list'" :list="selectedList" :party-id="partyId" />
          <div v-else class="text-center py-10 text-muted-foreground" role="status">
            Tipo de lista no soportado aún
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <CreateListModal :open="isCreateListOpen" @close="isCreateListOpen = false" @submit="handleCreateList" />
  </div>
</template>
