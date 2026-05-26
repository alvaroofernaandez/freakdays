<script setup lang="ts">
import {
  BookOpen,
  Plus,
  Minus,
  Trash2,
  Star,
  CheckCircle2,
  Heart,
  TrendingUp,
  Euro,
  X,
} from 'lucide-vue-next';
import type { MangaEntry } from '@/composables/useManga';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface Props {
  manga: MangaEntry;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  addVolume: [id: string];
  removeVolume: [id: string, volume: number];
  delete: [id: string];
  updatePrice: [id: string, price: number | null];
  updateStatus: [id: string, status: MangaEntry['status']];
}>();

const showPriceEdit = ref(false);
const priceInput = ref<string>('');

const progress = computed(() => {
  if (!props.manga.totalVolumes) return 0;
  return Math.round((props.manga.ownedVolumes.length / props.manga.totalVolumes) * 100);
});

const _isCompleted = computed(() => props.manga.status === 'completed');
const isWishlist = computed(() => props.manga.status === 'wishlist');

const statusConfig = computed(() => {
  switch (props.manga.status) {
    case 'completed':
      return {
        label: 'COMPLETA',
        color: 'bg-exp-legendary/20 text-exp-legendary border-exp-legendary/30',
        icon: CheckCircle2,
      };
    case 'wishlist':
      return { label: 'WISHLIST', color: 'bg-accent/20 text-accent border-accent/30', icon: Heart };
    case 'collecting':
      return {
        label: 'EN CURSO',
        color: 'bg-secondary/20 text-secondary border-secondary/30',
        icon: TrendingUp,
      };
    case 'dropped':
      return {
        label: 'ABANDONADA',
        color: 'bg-muted text-muted-foreground border-border',
        icon: X,
      };
    default:
      return {
        label: 'EN CURSO',
        color: 'bg-secondary/20 text-secondary border-secondary/30',
        icon: TrendingUp,
      };
  }
});

function handleAddVolume() {
  emit('addVolume', props.manga.id);
}

function handleRemoveLastVolume() {
  if (props.manga.ownedVolumes.length === 0) return;
  const lastVolume = Math.max(...props.manga.ownedVolumes);
  emit('removeVolume', props.manga.id, lastVolume);
}

function handleDelete() {
  emit('delete', props.manga.id);
}

function openPriceEdit() {
  priceInput.value = props.manga.pricePerVolume?.toString() ?? '';
  showPriceEdit.value = true;
}

function savePrice() {
  const price = priceInput.value.trim() === '' ? null : parseFloat(priceInput.value);
  if (price !== null && (isNaN(price) || price < 0)) return;

  emit('updatePrice', props.manga.id, price);
  showPriceEdit.value = false;
}

function handleStatusChange(newStatus: MangaEntry['status']) {
  emit('updateStatus', props.manga.id, newStatus);
}
</script>

<template>
  <Card
    class="rounded-none border-2 transition-[border-color,box-shadow] duration-100 hover:border-secondary/40 shadow-[0_5px_0_0_oklch(0.30_0.12_145)] hover:shadow-[0_5px_0_0_oklch(0.40_0.15_145)] active:translate-y-[4px] active:shadow-[0_1px_0_0_oklch(0.30_0.12_145)] motion-reduce:active:translate-y-0"
  >
    <CardHeader class="flex flex-row items-start gap-3 py-3 px-4">
      <div
        class="w-12 h-16 bg-muted flex items-center justify-center shrink-0 overflow-hidden rounded-none border border-border/50"
      >
        <img
          v-if="manga.coverUrl"
          :src="manga.coverUrl"
          :alt="manga.title"
          class="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <BookOpen v-else class="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <CardTitle class="text-sm font-medium truncate">{{ manga.title }}</CardTitle>
            <CardDescription v-if="manga.author" class="text-xs truncate">{{
              manga.author
            }}</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            class="h-7 w-7 rounded-none text-muted-foreground hover:text-destructive shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
            :aria-label="`Eliminar ${manga.title}`"
            @click="handleDelete"
          >
            <Trash2 class="h-3 w-3" aria-hidden="true" />
          </Button>
        </div>

        <div class="flex items-center gap-2 mt-2 flex-wrap">
          <Badge
            :class="statusConfig.color"
            class="font-pixel text-[7px] rounded-none border flex items-center gap-1"
          >
            <component :is="statusConfig.icon" class="h-3 w-3" aria-hidden="true" />
            {{ statusConfig.label }}
          </Badge>

          <Badge variant="outline" class="font-pixel text-[8px] rounded-none">
            {{ manga.ownedVolumes.length }} / {{ manga.totalVolumes ?? '?' }}
          </Badge>

          <span
            v-if="manga.score"
            class="font-pixel text-[8px] text-exp-medium flex items-center gap-0.5"
          >
            <Star class="h-3 w-3 fill-current" aria-hidden="true" />
            {{ manga.score }}
          </span>

          <span
            v-if="manga.totalCost && manga.totalCost > 0"
            class="font-pixel text-[8px] text-muted-foreground flex items-center gap-0.5"
          >
            <Euro class="h-3 w-3" aria-hidden="true" />
            {{ manga.totalCost.toFixed(2) }}
          </span>
        </div>

        <div v-if="!isWishlist" class="mt-2 space-y-1">
          <div
            class="flex items-center justify-between font-pixel text-[8px] text-muted-foreground"
          >
            <span>PROGRESO</span>
            <span>{{ progress }}%</span>
          </div>
          <div class="w-full h-1.5 bg-muted overflow-hidden">
            <div class="h-full bg-secondary transition-all" :style="{ width: `${progress}%` }" />
          </div>
        </div>
        <div class="flex items-center gap-2 mt-2 flex-wrap">
          <div v-if="!isWishlist" class="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              class="h-7 w-7 rounded-none cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
              :disabled="manga.ownedVolumes.length === 0"
              :aria-label="`Quitar último tomo de ${manga.title}`"
              @click="handleRemoveLastVolume"
            >
              <Minus class="h-3 w-3" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              class="h-7 w-7 rounded-none cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
              :disabled="
                manga.totalVolumes ? manga.ownedVolumes.length >= manga.totalVolumes : false
              "
              :aria-label="`Añadir tomo a ${manga.title}`"
              @click="handleAddVolume"
            >
              <Plus class="h-3 w-3" aria-hidden="true" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            class="h-7 font-pixel text-[8px] rounded-none cursor-pointer"
            @click="openPriceEdit"
          >
            <Euro class="h-3 w-3 mr-1" aria-hidden="true" />
            {{ manga.pricePerVolume ? `${manga.pricePerVolume.toFixed(2)}€/T` : 'PRECIO' }}
          </Button>

          <div class="flex items-center gap-1">
            <Button
              v-if="manga.status !== 'collecting'"
              variant="ghost"
              size="sm"
              class="h-7 font-pixel text-[8px] rounded-none cursor-pointer"
              @click="handleStatusChange('collecting')"
            >
              <TrendingUp class="h-3 w-3 mr-1" aria-hidden="true" />
              EN CURSO
            </Button>
            <Button
              v-if="manga.status !== 'completed'"
              variant="ghost"
              size="sm"
              class="h-7 font-pixel text-[8px] rounded-none cursor-pointer"
              @click="handleStatusChange('completed')"
            >
              <CheckCircle2 class="h-3 w-3 mr-1" aria-hidden="true" />
              COMPLETAR
            </Button>
            <Button
              v-if="manga.status !== 'wishlist'"
              variant="ghost"
              size="sm"
              class="h-7 font-pixel text-[8px] rounded-none cursor-pointer"
              @click="handleStatusChange('wishlist')"
            >
              <Heart class="h-3 w-3 mr-1" aria-hidden="true" />
              WISHLIST
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
          class="flex-1 h-8 px-2 text-sm rounded-none border-2 border-input bg-background focus:outline-none focus:border-primary"
          @keyup.enter="savePrice"
        />
        <Button
          size="sm"
          class="rounded-none font-pixel text-[8px] uppercase cursor-pointer"
          @click="savePrice"
        >
          GUARDAR
        </Button>
        <Button
          variant="ghost"
          size="sm"
          class="rounded-none font-pixel text-[8px] uppercase cursor-pointer"
          @click="showPriceEdit = false"
        >
          CANCELAR
        </Button>
      </div>
    </CardContent>
  </Card>
</template>
