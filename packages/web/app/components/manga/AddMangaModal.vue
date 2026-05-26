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

defineProps<Props>();

const emit = defineEmits<{
  close: [];
  submit: [dto: CreateMangaDTO];
}>();

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
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-sm"
    @click.self="handleClose"
  >
    <Card class="w-full max-w-md rounded-none border-2 shadow-xl">
      <CardHeader class="flex flex-row items-center justify-between pb-3 border-b">
        <CardTitle class="flex items-center gap-2 text-lg sm:text-xl">
          <BookOpen class="h-5 w-5 text-secondary" aria-hidden="true" />
          Añadir Manga
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8 rounded-none hover:bg-muted hover:text-foreground cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Cerrar"
          @click="handleClose"
        >
          <X class="h-4 w-4" aria-hidden="true" />
        </Button>
      </CardHeader>
      <CardContent class="space-y-4 pt-4">
        <div class="space-y-2">
          <Label for="title" class="font-pixel text-[9px] text-muted-foreground uppercase">
            <span class="text-secondary">▸</span> TÍTULO *
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

        <div class="flex gap-2">
          <Button
            class="flex-1 btn-game rounded-none font-pixel text-[10px] uppercase cursor-pointer shadow-[0_4px_0_0_oklch(0.30_0.12_145)] hover:shadow-[0_4px_0_0_oklch(0.40_0.15_145)] active:translate-y-[3px] active:shadow-none transition-[transform,box-shadow] duration-100 motion-reduce:active:translate-y-0"
            :disabled="!form.title.trim()"
            @click="handleSubmit"
          >
            <Plus class="h-4 w-4 mr-1.5" aria-hidden="true" />
            AÑADIR MANGA
          </Button>
          <Button
            variant="outline"
            class="rounded-none border-2 cursor-pointer"
            @click="handleClose"
          >
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
