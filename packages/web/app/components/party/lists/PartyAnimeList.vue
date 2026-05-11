<script setup lang="ts">
import AnimeMarketplace from '@/components/anime/AnimeMarketplace.vue'
import PartyAnimeCard from '@/components/party/lists/PartyAnimeCard.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { useSupabase } from '@/composables/useSupabase'
import { useToast } from '@/composables/useToast'
import { AlertCircle, Plus, RefreshCw, Search, Tv, X } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import type { PartyAnimeItem, PartySharedList } from '~~/domain/types/party'

const props = defineProps<{
  list: PartySharedList
  partyId: string
}>()

const items = ref<PartyAnimeItem[]>([])
const loading = ref(true)
const showMarketplace = ref(false)
const addingAnime = ref(false)
const deletingItemId = ref<string | null>(null)
const error = ref<string | null>(null)
const toast = useToast()
const supabase = useSupabase()

const stats = computed(() => {
  const watching = items.value.filter(i => i.status === 'watching').length
  const completed = items.value.filter(i => i.status === 'completed').length
  const total = items.value.length
  return { watching, completed, total }
})

async function getAuthToken(): Promise<string | null> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session?.access_token || null
  } catch {
    return null
  }
}

async function fetchItems() {
  loading.value = true
  error.value = null
  try {
    const token = await getAuthToken()
    const headers: Record<string, string> = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const data = await $fetch<PartySharedList>(`/api/party/lists/${props.list.id}`, {
      credentials: 'include',
      headers,
    })
    items.value = data.animeItems || []
  } catch (e: any) {
    const errorMsg = e.message || e.data?.message || 'Error al cargar items'
    error.value = errorMsg
    toast.error(errorMsg)
  } finally {
    loading.value = false
  }
}

async function handleAddItem(anime: any) {
  if (addingAnime.value) return

  addingAnime.value = true
  try {
    const token = await getAuthToken()
    const headers: Record<string, string> = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const newItem = await $fetch<PartyAnimeItem>(`/api/party/lists/${props.list.id}/items`, {
      method: 'POST',
      body: anime,
      credentials: 'include',
      headers,
    })
    items.value.unshift(newItem)
    toast.success('Anime añadido a la lista compartida')
    showMarketplace.value = false
  } catch (e: any) {
    const errorMsg = e.message || e.data?.message || 'Error al añadir anime'
    toast.error(errorMsg)
  } finally {
    addingAnime.value = false
  }
}

async function handleDelete(itemId: string) {
  if (deletingItemId.value === itemId) return

  deletingItemId.value = itemId
  try {
    const token = await getAuthToken()
    const headers: Record<string, string> = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    await $fetch(`/api/party/lists/${props.list.id}/items/${itemId}`, {
      method: 'DELETE' as any,
      credentials: 'include',
      headers,
    })

    items.value = items.value.filter(i => i.id !== itemId)
    toast.success('Anime eliminado de la lista')
  } catch (e: any) {
    const errorMsg = e.message || e.data?.message || 'Error al eliminar anime'
    toast.error(errorMsg)
  } finally {
    deletingItemId.value = null
  }
}

function handleCloseMarketplace() {
  showMarketplace.value = false
}

onMounted(() => {
  fetchItems()
})
</script>

<template>
  <div class="space-y-4 sm:space-y-6" role="main" aria-label="Lista de animes compartidos">
    <!-- Header con estadísticas -->
    <div v-if="!showMarketplace && !loading"
      class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <Tv class="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
          <h2 class="text-lg sm:text-xl font-bold truncate">{{ list.name }}</h2>
        </div>
        <p class="text-sm text-muted-foreground line-clamp-2">
          Gestiona y visualiza animes compartidos
        </p>
      </div>
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <Button variant="outline" size="sm" class="flex-1 sm:flex-none min-h-[44px] sm:min-h-0" :disabled="loading"
          @click="fetchItems" aria-label="Actualizar lista de animes">
          <RefreshCw :class="['h-4 w-4 mr-2', { 'animate-spin': loading }]" aria-hidden="true" />
          <span class="hidden sm:inline">Actualizar</span>
        </Button>
        <Button @click="showMarketplace = true" class="flex-1 sm:flex-none min-h-[44px] sm:min-h-0 glow-primary"
          aria-label="Añadir anime a la lista compartida">
          <Plus class="h-4 w-4 mr-2" aria-hidden="true" />
          <span>Añadir Anime</span>
        </Button>
      </div>
    </div>

    <!-- Estadísticas -->
    <div v-if="!showMarketplace && !loading && items.length > 0" class="grid grid-cols-3 gap-2 sm:gap-3">
      <Card class="border-primary/20 bg-primary/5">
        <CardContent class="p-3 sm:p-4">
          <div class="text-center">
            <p class="text-2xl sm:text-3xl font-bold text-primary">{{ stats.total }}</p>
            <p class="text-xs sm:text-sm text-muted-foreground mt-1">Total</p>
          </div>
        </CardContent>
      </Card>
      <Card class="border-exp-easy/20 bg-exp-easy/5">
        <CardContent class="p-3 sm:p-4">
          <div class="text-center">
            <p class="text-2xl sm:text-3xl font-bold text-exp-easy">{{ stats.completed }}</p>
            <p class="text-xs sm:text-sm text-muted-foreground mt-1">Completados</p>
          </div>
        </CardContent>
      </Card>
      <Card class="border-accent/20 bg-accent/5">
        <CardContent class="p-3 sm:p-4">
          <div class="text-center">
            <p class="text-2xl sm:text-3xl font-bold text-accent">{{ stats.watching }}</p>
            <p class="text-xs sm:text-sm text-muted-foreground mt-1">En curso</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Marketplace -->
    <Transition name="slide-fade">
      <Card v-if="showMarketplace"
        class="border-primary/30 bg-linear-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
        <div
          class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <CardHeader class="relative">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div class="flex-1 min-w-0">
              <CardTitle class="flex items-center gap-2 text-lg sm:text-xl">
                <Search class="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
                Buscar en Marketplace
              </CardTitle>
              <CardDescription class="mt-1.5">
                Encuentra animes para añadir a la lista compartida
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" class="h-9 w-9 shrink-0 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
              @click="handleCloseMarketplace" aria-label="Cerrar buscador de anime">
              <X class="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </CardHeader>
        <CardContent class="relative space-y-4">
          <AnimeMarketplace :adding="addingAnime" @add="handleAddItem" />
        </CardContent>
      </Card>
    </Transition>

    <!-- Contenido principal -->
    <div v-if="!showMarketplace" class="space-y-4">
      <!-- Estado de carga -->
      <div v-if="loading" class="space-y-3" role="status" aria-live="polite" aria-label="Cargando animes">
        <div v-for="i in 3" :key="i" class="card border rounded-lg p-4">
          <div class="flex gap-4">
            <Skeleton class="h-28 w-20 sm:h-32 sm:w-24 rounded-lg shrink-0" />
            <div class="flex-1 space-y-2">
              <Skeleton class="h-5 w-3/4" />
              <Skeleton class="h-4 w-1/2" />
              <Skeleton class="h-4 w-2/3" />
            </div>
            <Skeleton class="h-8 w-8 rounded shrink-0" />
          </div>
        </div>
      </div>

      <!-- Estado de error -->
      <Card v-else-if="error" class="border-destructive/30 bg-destructive/5">
        <CardContent class="p-4 sm:p-6">
          <div class="flex items-start gap-3">
            <AlertCircle class="h-5 w-5 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-destructive mb-1">Error al cargar la lista</h3>
              <p class="text-sm text-muted-foreground mb-3">{{ error }}</p>
              <Button variant="outline" size="sm" @click="fetchItems" class="min-h-[44px] sm:min-h-0">
                <RefreshCw class="h-4 w-4 mr-2" aria-hidden="true" />
                Intentar de nuevo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Estado vacío -->
      <Empty v-else-if="items.length === 0" title="No hay animes en esta lista"
        description="Añade animes para empezar a compartir con tu party" class="py-8 sm:py-12">
        <template #icon>
          <div class="relative">
            <div class="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div class="relative bg-linear-to-br from-primary/20 to-accent/20 p-4 rounded-full">
              <Tv class="h-12 w-12 text-primary" />
            </div>
          </div>
        </template>
        <template #action>
          <Button @click="showMarketplace = true" size="lg" class="min-h-[44px] glow-primary">
            <Plus class="h-5 w-5 mr-2" aria-hidden="true" />
            Añadir Primer Anime
          </Button>
        </template>
      </Empty>

      <!-- Lista de animes -->
      <TransitionGroup v-else name="list" tag="div" class="grid grid-cols-1 gap-3 sm:gap-4" role="list"
        aria-label="Lista de animes compartidos">
        <PartyAnimeCard v-for="item in items" :key="item.id" :anime="item" :is-deleting="deletingItemId === item.id"
          @delete="handleDelete" role="listitem"
          :aria-label="`${item.title}, ${item.status}, episodio ${item.currentEpisode}`" />
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.list-move {
  transition: transform 0.3s ease;
}
</style>
