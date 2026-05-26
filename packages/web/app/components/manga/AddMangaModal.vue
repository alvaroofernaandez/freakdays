<script setup lang="ts">
import { BookOpen, Plus, X } from 'lucide-vue-next';
import type { CreateMangaDTO } from '@/composables/useManga';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  show: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  submit: [dto: CreateMangaDTO];
}>();

const titleId = 'add-manga-modal-title';

const form = ref<CreateMangaDTO>({
  title: '',
  author: '',
  total_volumes: undefined,
  status: 'collecting',
  price_per_volume: undefined,
});

function handleSubmit() {
  if (!form.value.title.trim()) return;

  emit('submit', {
    ...form.value,
    author: form.value.author || undefined,
    total_volumes: form.value.total_volumes || undefined,
    price_per_volume: form.value.price_per_volume || undefined,
  });

  form.value = {
    title: '',
    author: '',
    total_volumes: undefined,
    status: 'collecting',
    price_per_volume: undefined,
  };
}

function handleClose() {
  emit('close');
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') handleClose();
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
  () => props.show,
  (isOpen) => {
    lockScroll(isOpen);
  },
);

onBeforeUnmount(() => lockScroll(false));
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-4 bg-background/85 backdrop-blur-md overflow-y-auto motion-safe:animate-in motion-safe:fade-in motion-safe:duration-150"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      @click.self="handleClose"
    >
      <Card
        class="relative w-full max-w-md my-auto flex flex-col max-h-[90dvh] overflow-hidden rounded-none border-2 border-accent/40 shadow-[0_0_0_1px_oklch(0.55_0.13_190/0.25),0_0_60px_-14px_oklch(0.65_0.15_190/0.6)] motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-200"
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
            <BookOpen
              class="h-5 w-5 shrink-0 text-accent drop-shadow-[0_0_6px_oklch(0.7_0.15_190)]"
              aria-hidden="true"
            />
            <CardTitle
              :id="titleId"
              class="font-pixel text-xs sm:text-sm uppercase tracking-wider text-foreground [text-shadow:_0_0_12px_oklch(0.7_0.15_190_/_0.45)] truncate"
            >
              Añadir Manga
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8 shrink-0 rounded-none hover:bg-accent/10 hover:text-accent cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Cerrar"
            @click="handleClose"
          >
            <X class="h-4 w-4" aria-hidden="true" />
          </Button>
        </CardHeader>

        <CardContent class="flex-1 min-h-0 overflow-y-auto space-y-4 pt-4">
          <div class="space-y-2">
            <Label for="title" class="font-pixel text-[9px] text-muted-foreground uppercase">
              <span class="text-accent">▸</span> TÍTULO *
            </Label>
            <Input
              id="title"
              v-model="form.title"
              placeholder="Ej: One Piece"
              class="w-full rounded-none border-2"
              @keyup.enter="handleSubmit"
            />
          </div>

          <div class="space-y-2">
            <Label for="author" class="font-pixel text-[9px] text-muted-foreground uppercase">
              <span class="text-primary">▸</span> AUTOR
              <span class="text-muted-foreground/50">(OPCIONAL)</span>
            </Label>
            <Input
              id="author"
              v-model="form.author"
              placeholder="Ej: Eiichiro Oda"
              class="w-full rounded-none border-2"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="volumes" class="font-pixel text-[9px] text-muted-foreground uppercase">
                <span class="text-accent">▸</span> TOMOS
              </Label>
              <Input
                id="volumes"
                v-model.number="form.total_volumes"
                type="number"
                placeholder="107"
                class="w-full rounded-none border-2"
                min="1"
              />
            </div>

            <div class="space-y-2">
              <Label for="price" class="font-pixel text-[9px] text-muted-foreground uppercase">
                <span class="text-exp-medium">▸</span> PRECIO/TOMO
              </Label>
              <Input
                id="price"
                v-model.number="form.price_per_volume"
                type="number"
                step="0.01"
                placeholder="9.99"
                class="w-full rounded-none border-2"
                min="0"
              />
            </div>
          </div>

          <div class="flex gap-2 pt-1">
            <Button
              class="flex-1 btn-game rounded-none font-pixel text-[10px] uppercase cursor-pointer shadow-[0_4px_0_0_oklch(0.35_0.15_190)] hover:shadow-[0_4px_0_0_oklch(0.45_0.18_190)] active:translate-y-[3px] active:shadow-none transition-[transform,box-shadow] duration-100 motion-reduce:active:translate-y-0 focus-visible:ring-2 focus-visible:ring-accent"
              :disabled="!form.title.trim()"
              @click="handleSubmit"
            >
              <Plus class="h-4 w-4 mr-1.5" aria-hidden="true" />
              AÑADIR MANGA
            </Button>
            <Button
              variant="outline"
              class="rounded-none border-2 font-pixel text-[10px] uppercase cursor-pointer hover:bg-muted/50 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
              @click="handleClose"
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </Teleport>
</template>
