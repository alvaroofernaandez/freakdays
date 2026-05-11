<script setup lang="ts">
import { BookOpen, Plus, Minus, Trash2, Star, Edit2, CheckCircle2, Heart, TrendingUp, Euro, X, MoreVertical } from 'lucide-vue-next'
import type { MangaEntry } from '@/composables/useManga'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

interface Props {
  manga: MangaEntry
}

const props = defineProps<Props>()

const emit = defineEmits<{
  addVolume: [id: string]
  removeVolume: [id: string, volume: number]
  delete: [id: string]
  updatePrice: [id: string, price: number | null]
  updateStatus: [id: string, status: MangaEntry['status']]
}>()

const showPriceEdit = ref(false)
const priceInput = ref<string>('')

const progress = computed(() => {
  if (!props.manga.totalVolumes) return 0
  return Math.round((props.manga.ownedVolumes.length / props.manga.totalVolumes) * 100)
})

const isCompleted = computed(() => props.manga.status === 'completed')
const isWishlist = computed(() => props.manga.status === 'wishlist')

const statusConfig = computed(() => {
  switch (props.manga.status) {
    case 'completed':
      return { label: 'Completada', color: 'bg-exp-legendary/20 text-exp-legendary', icon: CheckCircle2 }
    case 'wishlist':
      return { label: 'Wishlist', color: 'bg-accent/20 text-accent', icon: Heart }
    case 'collecting':
      return { label: 'En curso', color: 'bg-secondary/20 text-secondary', icon: TrendingUp }
    case 'dropped':
      return { label: 'Abandonada', color: 'bg-muted text-muted-foreground', icon: X }
    default:
      return { label: 'En curso', color: 'bg-secondary/20 text-secondary', icon: TrendingUp }
  }
})

function handleAddVolume() {
  emit('addVolume', props.manga.id)
}

function handleRemoveLastVolume() {
  if (props.manga.ownedVolumes.length === 0) return
  const lastVolume = Math.max(...props.manga.ownedVolumes)
  emit('removeVolume', props.manga.id, lastVolume)
}

function handleDelete() {
  emit('delete', props.manga.id)
}

function openPriceEdit() {
  priceInput.value = props.manga.pricePerVolume?.toString() ?? ''
  showPriceEdit.value = true
}

function savePrice() {
  const price = priceInput.value.trim() === '' ? null : parseFloat(priceInput.value)
  if (price !== null && (isNaN(price) || price < 0)) return
  
  emit('updatePrice', props.manga.id, price)
  showPriceEdit.value = false
}

function handleStatusChange(newStatus: MangaEntry['status']) {
  emit('updateStatus', props.manga.id, newStatus)
}
</script>

<template>
  <Card class="hover:border-primary/30 transition-colors">
    <CardHeader class="flex flex-row items-start gap-3 py-3 px-4">
      <div class="w-12 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
        <img 
          v-if="manga.coverUrl" 
          :src="manga.coverUrl" 
          :alt="manga.title"
          class="w-full h-full object-cover"
        />
        <BookOpen v-else class="h-6 w-6 text-muted-foreground" />
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <CardTitle class="text-sm font-medium truncate">{{ manga.title }}</CardTitle>
            <CardDescription v-if="manga.author" class="text-xs truncate">{{ manga.author }}</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            class="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
            @click="handleDelete"
          >
            <Trash2 class="h-3 w-3" />
          </Button>
        </div>

        <div class="flex items-center gap-2 mt-2 flex-wrap">
          <Badge :class="statusConfig.color" class="text-[10px] flex items-center gap-1">
            <component :is="statusConfig.icon" class="h-3 w-3" />
            {{ statusConfig.label }}
          </Badge>
          
          <Badge variant="outline" class="text-[10px]">
            {{ manga.ownedVolumes.length }} / {{ manga.totalVolumes ?? '?' }}
          </Badge>
          
          <span v-if="manga.score" class="text-xs text-exp-medium flex items-center gap-0.5">
            <Star class="h-3 w-3 fill-current" />
            {{ manga.score }}
          </span>

          <span v-if="manga.totalCost && manga.totalCost > 0" class="text-xs text-muted-foreground flex items-center gap-0.5">
            <Euro class="h-3 w-3" />
            {{ manga.totalCost.toFixed(2) }}
          </span>
        </div>

        <div v-if="!isWishlist" class="mt-2 space-y-1">
          <div class="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progreso</span>
            <span>{{ progress }}%</span>
          </div>
          <div class="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              class="h-full bg-primary rounded-full transition-all"
              :style="{ width: `${progress}%` }"
            />
          </div>
        </div>
        <div class="flex items-center gap-2 mt-2 flex-wrap">
          <div v-if="!isWishlist" class="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              class="h-7 w-7"
              @click="handleRemoveLastVolume"
              :disabled="manga.ownedVolumes.length === 0"
            >
              <Minus class="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              class="h-7 w-7"
              @click="handleAddVolume"
              :disabled="manga.totalVolumes ? manga.ownedVolumes.length >= manga.totalVolumes : false"
            >
              <Plus class="h-3 w-3" />
            </Button>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            class="h-7 text-xs"
            @click="openPriceEdit"
          >
            <Euro class="h-3 w-3 mr-1" />
            {{ manga.pricePerVolume ? `${manga.pricePerVolume.toFixed(2)}€/tomo` : 'Precio' }}
          </Button>

          <div class="flex items-center gap-1">
            <Button 
              v-if="manga.status !== 'collecting'"
              variant="ghost" 
              size="sm" 
              class="h-7 text-xs"
              @click="handleStatusChange('collecting')"
            >
              <TrendingUp class="h-3 w-3 mr-1" />
              En curso
            </Button>
            <Button 
              v-if="manga.status !== 'completed'"
              variant="ghost" 
              size="sm" 
              class="h-7 text-xs"
              @click="handleStatusChange('completed')"
            >
              <CheckCircle2 class="h-3 w-3 mr-1" />
              Completar
            </Button>
            <Button 
              v-if="manga.status !== 'wishlist'"
              variant="ghost" 
              size="sm" 
              class="h-7 text-xs"
              @click="handleStatusChange('wishlist')"
            >
              <Heart class="h-3 w-3 mr-1" />
              Wishlist
            </Button>
          </div>
        </div>
      </div>
    </CardHeader>

    <CardContent v-if="showPriceEdit" class="pt-0 px-4 pb-4 border-t border-border">
      <div class="flex items-center gap-2">
        <input
          v-model="priceInput"
          type="number"
          step="0.01"
          min="0"
          placeholder="Precio por tomo"
          class="flex-1 h-8 px-2 text-sm rounded-md border border-input bg-background"
          @keyup.enter="savePrice"
        />
        <Button size="sm" @click="savePrice">Guardar</Button>
        <Button variant="ghost" size="sm" @click="showPriceEdit = false">Cancelar</Button>
      </div>
    </CardContent>
  </Card>
</template>

