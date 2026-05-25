<script setup lang="ts">
import { Play, CheckCircle2, Pause, Tv, X } from 'lucide-vue-next';
import type { Component } from 'vue';
import type { AnimeStatus } from '@/composables/useAnime';
import type { AnimeSearchResult } from '@/composables/useAnimeSearch';

interface Props {
  anime: AnimeSearchResult | null;
  open: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  confirm: [status: AnimeStatus];
}>();

const selectedStatus = ref<AnimeStatus>('plan_to_watch');

const statusOptions: Array<{
  value: AnimeStatus;
  label: string;
  icon: Component;
  color: string;
  description: string;
}> = [
  {
    value: 'plan_to_watch',
    label: 'Pendiente',
    icon: Tv,
    color: 'text-muted-foreground',
    description: 'Animes que planeas ver',
  },
  {
    value: 'watching',
    label: 'En curso',
    icon: Play,
    color: 'text-primary',
    description: 'Animes que estás viendo actualmente',
  },
  {
    value: 'completed',
    label: 'Visto',
    icon: CheckCircle2,
    color: 'text-exp-easy',
    description: 'Animes que ya terminaste',
  },
  {
    value: 'on_hold',
    label: 'En pausa',
    icon: Pause,
    color: 'text-exp-medium',
    description: 'Animes que pausaste temporalmente',
  },
  {
    value: 'dropped',
    label: 'Droppeado',
    icon: X,
    color: 'text-destructive',
    description: 'Animes que dejaste de ver',
  },
];

const displayTitle = computed(() => props.anime?.title_english || props.anime?.title || '');

const coverUrl = computed(
  () =>
    props.anime?.images?.jpg?.large_image_url ||
    props.anime?.images?.jpg?.image_url ||
    props.anime?.images?.webp?.large_image_url ||
    null,
);

function handleConfirm() {
  emit('confirm', selectedStatus.value);
  emit('close');
}

function handleCancel() {
  emit('close');
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      selectedStatus.value = 'plan_to_watch';
    }
  },
);
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/95 backdrop-blur-sm overflow-y-auto"
    @click.self="handleCancel"
  >
    <Card class="w-full max-w-md my-auto shadow-xl rounded-none border-2">
      <CardHeader class="flex flex-row items-center justify-between pb-3 sm:pb-4 border-b">
        <div class="flex items-center gap-2">
          <Tv class="h-5 w-5 text-accent" aria-hidden="true" />
          <CardTitle class="text-lg sm:text-xl">Añadir Anime</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8 sm:h-9 sm:w-9 rounded-none hover:bg-muted hover:text-foreground cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Cerrar"
          @click="handleCancel"
        >
          <X class="h-4 w-4" aria-hidden="true" />
        </Button>
      </CardHeader>

      <CardContent class="space-y-4 pt-4 sm:pt-6">
        <p class="font-pixel text-[9px] text-muted-foreground/80 uppercase">
          <span class="text-accent">▸</span> SELECCIONA EL ESTADO INICIAL
        </p>

        <div v-if="anime" class="flex gap-3 p-3 border border-border/50 bg-muted/30">
          <div class="relative w-16 h-24 overflow-hidden shrink-0 bg-muted rounded-none">
            <img
              v-if="coverUrl"
              :src="coverUrl"
              :alt="displayTitle"
              class="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div v-else class="w-full h-full flex items-center justify-center" aria-hidden="true">
              <Tv class="h-6 w-6 text-muted-foreground/50" />
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-sm line-clamp-2">
              {{ displayTitle }}
            </h3>
            <p
              v-if="anime.title_japanese && anime.title_japanese !== anime.title"
              class="text-xs text-muted-foreground mt-0.5"
            >
              {{ anime.title_japanese }}
            </p>
          </div>
        </div>

        <div class="space-y-2">
          <Label class="font-pixel text-[9px] text-muted-foreground uppercase">
            <span class="text-primary">▸</span> ESTADO INICIAL
          </Label>
          <div class="grid grid-cols-1 gap-2">
            <button
              v-for="option in statusOptions"
              :key="option.value"
              type="button"
              :class="[
                'flex items-start gap-3 p-3 border-2 transition-all text-left cursor-pointer rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                selectedStatus === option.value
                  ? 'border-accent bg-accent/10'
                  : 'border-border hover:border-accent/40 hover:bg-muted/50',
              ]"
              @click="selectedStatus = option.value"
            >
              <component
                :is="option.icon"
                :class="['h-5 w-5 shrink-0 mt-0.5', option.color]"
                aria-hidden="true"
              />
              <div class="flex-1 min-w-0">
                <div class="font-pixel text-[9px] uppercase text-foreground">
                  {{ option.label }}
                </div>
                <div class="text-xs text-muted-foreground mt-0.5">
                  {{ option.description }}
                </div>
              </div>
              <div
                v-if="selectedStatus === option.value"
                class="w-2 h-2 bg-accent shrink-0 mt-2 motion-safe:animate-pulse"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </CardContent>

      <CardFooter class="flex justify-end gap-2 pt-4 border-t">
        <Button
          variant="outline"
          class="rounded-none border-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
          @click="handleCancel"
        >
          Cancelar
        </Button>
        <Button
          autofocus
          class="btn-game rounded-none font-pixel text-[10px] uppercase cursor-pointer shadow-[0_4px_0_0_oklch(0.35_0.15_190)] hover:shadow-[0_4px_0_0_oklch(0.45_0.18_190)] active:translate-y-[3px] active:shadow-none transition-[transform,box-shadow] duration-100 motion-reduce:active:translate-y-0 focus-visible:ring-2 focus-visible:ring-ring"
          @click="handleConfirm"
        >
          AÑADIR ANIME
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
