<script setup lang="ts">
import { X } from 'lucide-vue-next'
import type { CreateMangaDTO } from '@/composables/useManga'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  show: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  submit: [dto: CreateMangaDTO]
}>()

const form = ref<CreateMangaDTO>({
  title: '',
  author: '',
  total_volumes: undefined,
  status: 'collecting',
  price_per_volume: undefined,
})

function handleSubmit() {
  if (!form.value.title.trim()) return

  emit('submit', {
    ...form.value,
    author: form.value.author || undefined,
    total_volumes: form.value.total_volumes || undefined,
    price_per_volume: form.value.price_per_volume || undefined,
  })

  form.value = {
    title: '',
    author: '',
    total_volumes: undefined,
    status: 'collecting',
    price_per_volume: undefined,
  }
}

function handleClose() {
  emit('close')
}
</script>

<template>
  <div 
    v-if="show" 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
    @click.self="handleClose"
  >
    <Card class="w-full max-w-md">
      <CardHeader class="flex flex-row items-center justify-between">
        <CardTitle>Añadir Manga</CardTitle>
        <Button variant="ghost" size="icon" @click="handleClose">
          <X class="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="title">Título *</Label>
          <Input 
            id="title" 
            v-model="form.title" 
            placeholder="Ej: One Piece" 
            class="w-full"
            @keyup.enter="handleSubmit"
          />
        </div>

        <div class="space-y-2">
          <Label for="author">Autor (opcional)</Label>
          <Input 
            id="author" 
            v-model="form.author" 
            placeholder="Ej: Eiichiro Oda" 
            class="w-full"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="volumes">Tomos totales (opcional)</Label>
            <Input 
              id="volumes" 
              v-model.number="form.total_volumes" 
              type="number" 
              placeholder="107" 
              class="w-full"
              min="1"
            />
          </div>

          <div class="space-y-2">
            <Label for="price">Precio por tomo (opcional)</Label>
            <Input 
              id="price" 
              v-model.number="form.price_per_volume" 
              type="number" 
              step="0.01"
              placeholder="9.99" 
              class="w-full"
              min="0"
            />
          </div>
        </div>

        <div class="flex gap-2">
          <Button class="flex-1" @click="handleSubmit" :disabled="!form.title.trim()">
            Añadir Manga
          </Button>
          <Button variant="outline" @click="handleClose">
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

