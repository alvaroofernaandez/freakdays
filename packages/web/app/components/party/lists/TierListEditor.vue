<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSupabase } from '@/composables/useSupabase'
import { useToast } from '@/composables/useToast'
import { AlertCircle, ChevronDown, ChevronUp, LayoutGrid, Pencil, Plus, Save, Trash2 } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import draggable from 'vuedraggable'
import type { PartySharedList, Tier, TierItem, TierListState } from '~~/domain/types/party'
import { useAuthStore } from '~~/stores/auth'

const props = defineProps<{
  list: PartySharedList
  partyId: string
}>()

const toast = useToast()
const authStore = useAuthStore()
const isSaving = ref(false)
const isDragging = ref(false)

const TIER_COLORS = ['#FF7F7F', '#FFBF7F', '#FFFF7F', '#7FFF7F', '#7FFFFF', '#7F7FFF', '#FF7FFF']

const listName = ref(props.list.name)
const tiers = ref<Tier[]>([])
const pool = ref<TierItem[]>([])
const newItemText = ref('')

const totalItems = computed(() => {
  const tierItems = tiers.value.reduce((sum, tier) => sum + tier.items.length, 0)
  return tierItems + pool.value.length
})

const isEmpty = computed(() => totalItems.value === 0)

const isMobile = computed(() => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 1024
})

onMounted(() => {
  if (props.list.content) {
    const content = props.list.content as TierListState
    tiers.value = content.tiers || []
    pool.value = content.pool || []
  }

  if (tiers.value.length === 0) {
    tiers.value = [
      { id: 's', name: 'S', color: '#FF7F7F', items: [] },
      { id: 'a', name: 'A', color: '#FFBF7F', items: [] },
      { id: 'b', name: 'B', color: '#FFFF7F', items: [] },
      { id: 'c', name: 'C', color: '#7FFF7F', items: [] },
    ]
  }
})

async function save() {
  if (isSaving.value) return

  isSaving.value = true
  try {
    const token = await getAuthToken()
    const headers: Record<string, string> = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const content: TierListState = {
      tiers: tiers.value,
      pool: pool.value
    }

    await $fetch(`/api/party/lists/${props.list.id}`, {
      method: 'PUT',
      body: { name: listName.value, content },
      credentials: 'include',
      headers,
    })
    toast.success('Tier List guardada exitosamente')
  } catch (e: any) {
    console.error('Error saving tier list:', e)
    toast.error(e.message || 'Error al guardar la tier list')
  } finally {
    isSaving.value = false
  }
}

async function getAuthToken(): Promise<string | null> {
  try {
    const supabase = useSupabase()
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  } catch {
    return null
  }
}

function addItem() {
  if (!newItemText.value.trim()) {
    toast.info('Escribe un nombre para el item')
    return
  }

  pool.value.push({
    id: crypto.randomUUID(),
    content: newItemText.value.trim(),
    type: 'text'
  })
  newItemText.value = ''
}

function removeItem(id: string) {
  const poolIndex = pool.value.findIndex(i => i.id === id)
  if (poolIndex !== -1) {
    pool.value.splice(poolIndex, 1)
    toast.info('Item eliminado')
    return
  }

  for (const tier of tiers.value) {
    const idx = tier.items.findIndex(i => i.id === id)
    if (idx !== -1) {
      tier.items.splice(idx, 1)
      toast.info('Item eliminado del tier')
      return
    }
  }
}

function addTier() {
  const nextColor = TIER_COLORS[tiers.value.length % TIER_COLORS.length] ?? '#FF7F7F'
  tiers.value.push({
    id: crypto.randomUUID(),
    name: `Tier ${tiers.value.length + 1}`,
    color: nextColor,
    items: []
  })
  toast.success('Nuevo tier añadido')
}

function removeTier(tierId: string) {
  const tier = tiers.value.find(t => t.id === tierId)
  if (!tier) return

  if (tier.items.length > 0) {
    pool.value.push(...tier.items)
    toast.info(`${tier.items.length} items movidos al pool`)
  }

  tiers.value = tiers.value.filter(t => t.id !== tierId)
  toast.success('Tier eliminado')
}

function moveTierUp(index: number) {
  if (index <= 0) return
  const temp = tiers.value[index - 1]!
  tiers.value[index - 1] = tiers.value[index]!
  tiers.value[index] = temp
}

function moveTierDown(index: number) {
  if (index >= tiers.value.length - 1) return
  const temp = tiers.value[index + 1]!
  tiers.value[index + 1] = tiers.value[index]!
  tiers.value[index] = temp
}

function handleDragStart() {
  isDragging.value = true
}

function handleDragEnd() {
  isDragging.value = false
}
</script>

<template>
  <div class="space-y-4 sm:space-y-6" role="main" aria-label="Editor de Tier List">
    <!-- Header with Title and Save Button -->
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 bg-card border rounded-lg p-4 sm:p-5 shadow-sm">
      <div class="flex items-center gap-3 flex-1 w-full sm:w-auto">
        <div class="p-2 bg-primary/10 rounded-lg shrink-0">
          <LayoutGrid class="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <Pencil class="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
            <Input v-model="listName"
              class="font-semibold text-base sm:text-lg border-none bg-transparent p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Nombre de la tier list" aria-label="Nombre de la tier list" />
          </div>
          <p class="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Arrastra items entre tiers o desde el pool
          </p>
        </div>
      </div>
      <Button @click="save" :disabled="isSaving" class="min-h-[44px] sm:min-h-0 w-full sm:w-auto"
        aria-label="Guardar cambios en la tier list">
        <Save v-if="!isSaving" class="h-4 w-4 mr-2" aria-hidden="true" />
        <span v-else class="animate-spin mr-2 inline-block" role="status" aria-label="Guardando">⏳</span>
        {{ isSaving ? 'Guardando...' : 'Guardar Cambios' }}
      </Button>
    </div>

    <!-- Tiers -->
    <div class="space-y-1 bg-background rounded-lg overflow-hidden border shadow-sm" role="region"
      aria-label="Tiers de clasificación">
      <div v-for="(tier, tierIndex) in tiers" :key="tier.id"
        class="flex flex-col sm:flex-row min-h-[120px] sm:min-h-[100px] border-b last:border-0 relative group/tier hover:bg-muted/5 transition-colors"
        role="group" :aria-label="`Tier ${tier.name}`">
        <!-- Tier Header -->
        <div
          class="w-full sm:w-32 md:w-40 flex items-center justify-between p-3 sm:p-3 font-bold text-black select-none shrink-0 border-b sm:border-b-0 sm:border-r border-border/50"
          :style="{ backgroundColor: tier.color }" role="banner">
          <div class="flex-1 min-w-0">
            <Input v-model="tier.name"
              class="font-bold text-xl sm:text-2xl text-black bg-transparent border-none p-0 h-auto w-full text-center focus-visible:ring-0 focus-visible:ring-offset-0 drop-shadow-sm placeholder:text-black/50"
              placeholder="Nombre" :aria-label="`Nombre del tier ${tier.name}`" />
          </div>
          <!-- Tier Controls -->
          <div class="flex flex-row sm:flex-col gap-1 ml-2 bg-black/20 rounded-lg p-1">
            <button v-if="tierIndex > 0" @click="moveTierUp(tierIndex)"
              class="p-1.5 bg-white/30 hover:bg-white/50 rounded-md transition-colors min-w-[28px] min-h-[28px] flex items-center justify-center"
              :aria-label="`Mover tier ${tier.name} arriba`">
              <ChevronUp class="h-4 w-4 text-black" aria-hidden="true" />
            </button>
            <button v-if="tierIndex < tiers.length - 1" @click="moveTierDown(tierIndex)"
              class="p-1.5 bg-white/30 hover:bg-white/50 rounded-md transition-colors min-w-[28px] min-h-[28px] flex items-center justify-center"
              :aria-label="`Mover tier ${tier.name} abajo`">
              <ChevronDown class="h-4 w-4 text-black" aria-hidden="true" />
            </button>
            <button @click="removeTier(tier.id)"
              class="p-1.5 bg-red-500/40 hover:bg-red-500/70 rounded-md transition-colors min-w-[28px] min-h-[28px] flex items-center justify-center"
              :aria-label="`Eliminar tier ${tier.name}`">
              <Trash2 class="h-4 w-4 text-white" aria-hidden="true" />
            </button>
          </div>
        </div>

        <!-- Drop Zone -->
        <div class="flex-1 bg-muted/20 p-3 sm:p-2 min-h-[80px]" role="region"
          :aria-label="`Zona de drop para tier ${tier.name}`">
          <draggable v-model="tier.items" group="tierlist" item-key="id" :disabled="isMobile" @start="handleDragStart"
            @end="handleDragEnd" class="flex flex-wrap gap-2 h-full min-h-[60px]"
            :class="{ 'pointer-events-none': isMobile }">
            <template #item="{ element }">
              <div
                class="relative group/item cursor-grab active:cursor-grabbing bg-card border rounded-lg p-2.5 sm:p-2 shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-200 touch-manipulation min-h-[44px] sm:min-h-0"
                :class="{ 'opacity-50': isDragging }" role="button"
                :aria-label="`Item: ${element.content}. Arrastra para mover o presiona para eliminar`" tabindex="0"
                @keydown.enter="removeItem(element.id)" @keydown.delete="removeItem(element.id)">
                <span class="pr-7 sm:pr-6 block text-sm font-medium wrap-break-word">{{ element.content }}</span>
                <button
                  class="absolute top-1.5 right-1.5 sm:top-1 sm:right-1 opacity-0 group-hover/item:opacity-100 group-focus/item:opacity-100 p-1.5 sm:p-1 hover:bg-destructive hover:text-destructive-foreground rounded transition-opacity min-h-[32px] min-w-[32px] sm:min-h-0 sm:min-w-0 flex items-center justify-center touch-manipulation"
                  @click.stop="removeItem(element.id)" :aria-label="`Eliminar item: ${element.content}`">
                  <Trash2 class="h-3.5 w-3.5 sm:h-3 sm:w-3" aria-hidden="true" />
                </button>
              </div>
            </template>
            <template #empty>
              <div class="flex items-center justify-center h-full min-h-[60px] text-xs text-muted-foreground italic"
                role="status">
                Arrastra items aquí
              </div>
            </template>
          </draggable>
        </div>
      </div>

      <!-- Add Tier Button -->
      <div class="p-3 border-t bg-muted/10">
        <Button @click="addTier" variant="outline" class="w-full min-h-[44px] border-dashed"
          aria-label="Añadir nuevo tier">
          <Plus class="h-4 w-4 mr-2" aria-hidden="true" />
          Añadir Tier
        </Button>
      </div>
    </div>

    <!-- Pool Section -->
    <div class="bg-card border rounded-lg p-4 sm:p-5 space-y-4 shadow-sm" role="region"
      aria-label="Items sin clasificar">
      <div class="flex items-center justify-between">
        <h4 class="font-semibold text-base sm:text-lg flex items-center gap-2">
          <LayoutGrid class="h-4 w-4 text-primary" aria-hidden="true" />
          Items Sin Clasificar
        </h4>
        <span class="text-xs sm:text-sm text-muted-foreground bg-muted px-2.5 py-1 rounded-full font-medium"
          role="status" :aria-label="`${pool.length} items sin clasificar`">
          {{ pool.length }}
        </span>
      </div>

      <div class="flex flex-col sm:flex-row gap-2" role="group" aria-label="Añadir nuevo item">
        <div class="flex-1 space-y-1.5">
          <Label for="new-item-input" class="text-xs text-muted-foreground sr-only">
            Nombre del nuevo item
          </Label>
          <Input id="new-item-input" v-model="newItemText" placeholder="Escribe el nombre del item..."
            class="w-full min-h-[44px] sm:min-h-0" maxlength="100" aria-describedby="new-item-helper"
            @keydown.enter.prevent="addItem()" />
          <p id="new-item-helper" class="text-xs text-muted-foreground">
            Presiona Enter o el botón para añadir
          </p>
        </div>
        <Button @click="addItem" variant="secondary" class="min-h-[44px] sm:min-h-0 shrink-0"
          :disabled="!newItemText.trim()" aria-label="Añadir item a la lista">
          <Plus class="h-4 w-4 sm:mr-2" aria-hidden="true" />
          <span class="hidden sm:inline">Añadir</span>
        </Button>
      </div>

      <div class="min-h-[120px] sm:min-h-[100px] p-4 bg-muted/30 rounded-lg border-2 border-dashed transition-colors"
        :class="{ 'border-primary/30 bg-primary/5': pool.length === 0 }" role="region"
        aria-label="Pool de items sin clasificar">
        <div v-if="pool.length === 0"
          class="flex flex-col items-center justify-center h-full min-h-[100px] text-center text-muted-foreground"
          role="status">
          <AlertCircle class="h-8 w-8 mb-2 opacity-50" aria-hidden="true" />
          <p class="text-sm font-medium">No hay items sin clasificar</p>
          <p class="text-xs mt-1">Añade items usando el campo de arriba</p>
        </div>
        <draggable v-else v-model="pool" group="tierlist" item-key="id" :disabled="isMobile" @start="handleDragStart"
          @end="handleDragEnd" class="flex flex-wrap gap-2" :class="{ 'pointer-events-none': isMobile }">
          <template #item="{ element }">
            <div
              class="relative group/item cursor-grab active:cursor-grabbing bg-card border rounded-lg p-2.5 sm:p-2 shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-200 touch-manipulation min-h-[44px] sm:min-h-0"
              :class="{ 'opacity-50': isDragging }" role="button"
              :aria-label="`Item: ${element.content}. Arrastra para mover a un tier o presiona para eliminar`"
              tabindex="0" @keydown.enter="removeItem(element.id)" @keydown.delete="removeItem(element.id)">
              <span class="pr-7 sm:pr-6 block text-sm font-medium wrap-break-word">{{ element.content }}</span>
              <button
                class="absolute top-1.5 right-1.5 sm:top-1 sm:right-1 opacity-0 group-hover/item:opacity-100 group-focus/item:opacity-100 p-1.5 sm:p-1 hover:bg-destructive hover:text-destructive-foreground rounded transition-opacity min-h-[32px] min-w-[32px] sm:min-h-0 sm:min-w-0 flex items-center justify-center touch-manipulation"
                @click.stop="removeItem(element.id)" :aria-label="`Eliminar item: ${element.content}`">
                <Trash2 class="h-3.5 w-3.5 sm:h-3 sm:w-3" aria-hidden="true" />
              </button>
            </div>
          </template>
        </draggable>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="isEmpty"
      class="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20 flex flex-col items-center gap-3"
      role="status" aria-live="polite">
      <LayoutGrid class="h-12 w-12 text-muted-foreground opacity-50" aria-hidden="true" />
      <div>
        <p class="font-medium text-base">Tu tier list está vacía</p>
        <p class="text-sm text-muted-foreground mt-1">Añade items usando el campo de arriba para empezar</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sortable-ghost {
  opacity: 0.4;
  background: var(--muted);
  transform: scale(0.95);
}

.sortable-drag {
  opacity: 0.8;
  transform: rotate(2deg);
}

@media (max-width: 1023px) {

  .sortable-ghost,
  .sortable-drag {
    opacity: 1;
    transform: none;
  }
}
</style>
