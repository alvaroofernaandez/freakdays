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

const titleId = 'add-anime-modal-title';

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

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') handleCancel();
}

function lockScroll(lock: boolean) {
  if (!import.meta.client) return;
  if (lock) {
    document.addEventListener('keydown', onKeydown);
    document.body.style.overflow = 'hidden';
  } else {
    document.removeEventListener('keydown', onKeydown);
    document.body.style.overflow = '';
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      selectedStatus.value = 'plan_to_watch';
    }
    lockScroll(isOpen);
  },
);

onBeforeUnmount(() => lockScroll(false));
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-4 bg-background/85 backdrop-blur-md overflow-y-auto motion-safe:animate-in motion-safe:fade-in motion-safe:duration-150"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      @click.self="handleCancel"
    >
      <Card
        class="relative w-full max-w-md sm:max-w-2xl my-auto flex flex-col max-h-[90dvh] overflow-hidden rounded-none border-2 border-accent/40 shadow-[0_0_0_1px_oklch(0.55_0.13_190/0.25),0_0_60px_-14px_oklch(0.65_0.15_190/0.6)] motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-200"
      >
        <!-- Arcade neon strip -->
        <div
          class="h-1 shrink-0 bg-gradient-to-r from-accent via-primary to-accent"
          aria-hidden="true"
        />

        <CardHeader
          class="shrink-0 flex flex-row items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-accent/30"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <Tv
              class="h-5 w-5 shrink-0 text-accent drop-shadow-[0_0_6px_oklch(0.7_0.15_190)]"
              aria-hidden="true"
            />
            <CardTitle
              :id="titleId"
              class="font-pixel text-xs sm:text-sm uppercase tracking-wider text-foreground [text-shadow:_0_0_12px_oklch(0.7_0.15_190_/_0.45)] truncate"
            >
              Añadir Anime
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-none hover:bg-accent/10 hover:text-accent cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Cerrar"
            @click="handleCancel"
          >
            <X class="h-4 w-4" aria-hidden="true" />
          </Button>
        </CardHeader>

        <CardContent class="flex-1 min-h-0 overflow-y-auto space-y-4 pt-4 sm:pt-6">
          <div v-if="anime" class="space-y-2">
            <p class="font-pixel text-[9px] text-muted-foreground/80 uppercase">
              <span class="text-accent">▸</span> Anime seleccionado
            </p>
            <div class="flex gap-3 p-3 border-2 border-accent/20 bg-accent/5">
              <div
                class="relative w-16 h-24 overflow-hidden shrink-0 bg-muted rounded-none border border-border"
              >
                <img
                  v-if="coverUrl"
                  :src="coverUrl"
                  :alt="displayTitle"
                  class="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center"
                  aria-hidden="true"
                >
                  <Tv class="h-6 w-6 text-muted-foreground/50" />
                </div>
              </div>
              <div class="flex-1 min-w-0 self-center">
                <h3 class="font-semibold text-sm line-clamp-2">
                  {{ displayTitle }}
                </h3>
                <p
                  v-if="anime.title_japanese && anime.title_japanese !== anime.title"
                  class="text-xs text-muted-foreground mt-0.5 line-clamp-1"
                >
                  {{ anime.title_japanese }}
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <Label class="font-pixel text-[9px] text-muted-foreground uppercase">
              <span class="text-primary">▸</span> Selecciona el estado inicial
            </Label>
            <div
              class="grid grid-cols-1 sm:grid-cols-2 gap-2"
              role="radiogroup"
              aria-label="Estado inicial"
            >
              <button
                v-for="option in statusOptions"
                :key="option.value"
                type="button"
                role="radio"
                :aria-checked="selectedStatus === option.value"
                :class="[
                  'group flex items-start gap-3 p-3 border-2 text-left cursor-pointer rounded-none transition-[border-color,background-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  selectedStatus === option.value
                    ? 'border-accent bg-accent/10 shadow-[0_0_18px_-5px_oklch(0.7_0.15_190),inset_0_0_0_1px_oklch(0.6_0.15_190/0.35)]'
                    : 'border-border hover:border-accent/50 hover:bg-accent/5',
                ]"
                @click="selectedStatus = option.value"
              >
                <component
                  :is="option.icon"
                  :class="['h-5 w-5 shrink-0 mt-0.5', option.color]"
                  aria-hidden="true"
                />
                <div class="flex-1 min-w-0">
                  <div
                    :class="[
                      'font-pixel text-[9px] uppercase transition-colors',
                      selectedStatus === option.value ? 'text-accent' : 'text-foreground',
                    ]"
                  >
                    {{ option.label }}
                  </div>
                  <div class="text-xs text-muted-foreground mt-1 leading-snug">
                    {{ option.description }}
                  </div>
                </div>
                <div
                  v-if="selectedStatus === option.value"
                  class="w-2 h-2 bg-accent shrink-0 mt-1 shadow-[0_0_8px_0_oklch(0.7_0.15_190)] motion-safe:animate-pulse"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </CardContent>

        <CardFooter class="shrink-0 flex justify-end gap-2 pt-4 border-t border-accent/30 bg-card">
          <Button
            variant="outline"
            class="rounded-none border-2 font-pixel text-[10px] uppercase cursor-pointer hover:bg-muted/50 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            @click="handleCancel"
          >
            Cancelar
          </Button>
          <Button
            autofocus
            class="btn-game rounded-none font-pixel text-[10px] uppercase cursor-pointer shadow-[0_4px_0_0_oklch(0.35_0.15_190)] hover:shadow-[0_4px_0_0_oklch(0.45_0.18_190)] active:translate-y-[3px] active:shadow-none transition-[transform,box-shadow] duration-100 motion-reduce:active:translate-y-0 focus-visible:ring-2 focus-visible:ring-accent"
            @click="handleConfirm"
          >
            Añadir Anime
          </Button>
        </CardFooter>
      </Card>
    </div>
  </Teleport>
</template>
