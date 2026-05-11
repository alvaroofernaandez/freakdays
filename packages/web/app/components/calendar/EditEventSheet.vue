<script setup lang="ts">
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { Ticket, Tv, BookOpen, Save } from 'lucide-vue-next'
import type { Release, ReleaseType, CreateReleaseDTO } from '@/composables/useCalendar'

interface Props {
  open: boolean
  release: Release | null
  isSubmitting: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [id: string, dto: Partial<CreateReleaseDTO>]
}>()

const editForm = ref<Partial<CreateReleaseDTO>>({
  title: '',
  type: 'anime_episode',
  release_date: '',
  description: '',
  url: '',
})

const typeConfig: Record<ReleaseType, { icon: any; color: string; label: string }> = {
  anime_episode: { icon: Tv, color: 'text-primary', label: 'Episodio Anime' },
  manga_volume: { icon: BookOpen, color: 'text-exp-easy', label: 'Tomo Manga' },
  event: { icon: Ticket, color: 'text-exp-legendary', label: 'Evento' },
}

watch(() => props.release, (release) => {
  if (release) {
    editForm.value = {
      title: release.title,
      type: release.type,
      release_date: release.releaseDate.toISOString().split('T')[0],
      description: release.description || '',
      url: release.url || '',
    }
  }
}, { immediate: true })

watch(() => props.open, (open) => {
  if (open && props.release) {
    editForm.value = {
      title: props.release.title,
      type: props.release.type,
      release_date: props.release.releaseDate.toISOString().split('T')[0],
      description: props.release.description || '',
      url: props.release.url || '',
    }
  }
})

function handleSave() {
  if (!props.release || !editForm.value.title?.trim()) return

  const dto: Partial<CreateReleaseDTO> = {
    title: editForm.value.title,
    type: editForm.value.type,
    release_date: editForm.value.release_date,
    description: editForm.value.description || undefined,
    url: editForm.value.url || undefined,
  }

  emit('save', props.release.id, dto)
}

function handleClose() {
  emit('update:open', false)
}
</script>

<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)">
    <SheetContent side="right" class="w-full sm:w-[400px] overflow-y-auto">
      <SheetHeader>
        <SheetTitle class="text-lg sm:text-xl">Editar Evento</SheetTitle>
        <SheetDescription class="text-sm">
          Modifica los detalles del evento. Los cambios se guardarán automáticamente.
        </SheetDescription>
      </SheetHeader>

      <div v-if="release" class="mt-6 space-y-4 sm:space-y-5">
        <div class="space-y-2">
          <Label for="edit-title" class="text-sm font-semibold">Título *</Label>
          <Input
            id="edit-title"
            v-model="editForm.title"
            placeholder="Ej: One Piece Ep. 1120"
            class="w-full h-11 sm:h-10 text-sm"
            maxlength="100"
            aria-required="true"
            autocomplete="off"
            :disabled="isSubmitting"
            @keydown.enter.prevent="handleSave"
          />
          <p class="text-xs text-muted-foreground">
            {{ (editForm.title || '').length }}/100 caracteres
          </p>
        </div>

        <div class="space-y-2">
          <Label for="edit-date" class="text-sm font-semibold">Fecha *</Label>
          <DatePicker
            id="edit-date"
            v-model="editForm.release_date"
            placeholder="Selecciona una fecha"
            class="w-full h-11 sm:h-10"
            aria-required="true"
            :disabled="isSubmitting"
          />
        </div>

        <div class="space-y-2">
          <Label class="text-sm font-semibold">Tipo *</Label>
          <div class="grid grid-cols-3 gap-2 sm:gap-3" role="radiogroup" aria-label="Tipo de evento">
            <Button
              v-for="(config, type) in typeConfig"
              :key="type"
              :variant="editForm.type === type ? 'default' : 'outline'"
              size="sm"
              class="text-xs sm:text-sm flex-col h-auto py-3 sm:py-4 touch-manipulation min-h-[80px] sm:min-h-[90px] transition-all"
              :class="editForm.type === type && 'ring-2 ring-primary/50 shadow-md'"
              :aria-pressed="editForm.type === type"
              role="radio"
              :aria-label="config.label"
              :disabled="isSubmitting"
              @click="editForm.type = type"
            >
              <component
                :is="config.icon"
                :class="['h-5 w-5 sm:h-6 sm:w-6 mb-2', config.color]"
                aria-hidden="true"
              />
              <span class="font-semibold">{{ config.label.split(' ')[0] }}</span>
            </Button>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="edit-description" class="text-sm font-semibold">Descripción</Label>
          <textarea
            id="edit-description"
            v-model="editForm.description"
            placeholder="Descripción opcional del evento..."
            class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            :disabled="isSubmitting"
          />
        </div>

        <div class="space-y-2">
          <Label for="edit-url" class="text-sm font-semibold">URL</Label>
          <Input
            id="edit-url"
            v-model="editForm.url"
            type="url"
            placeholder="https://..."
            class="w-full h-11 sm:h-10 text-sm"
            autocomplete="off"
            :disabled="isSubmitting"
          />
        </div>

        <div class="pt-2 flex gap-2">
          <Button
            variant="outline"
            class="flex-1 min-h-[44px] touch-manipulation"
            @click="handleClose"
            :disabled="isSubmitting"
          >
            Cancelar
          </Button>
          <Button
            class="flex-1 min-h-[44px] text-sm font-semibold glow-primary touch-manipulation cursor-pointer"
            @click="handleSave"
            :disabled="!editForm.title?.trim() || !editForm.release_date || isSubmitting"
            :aria-label="`Guardar cambios para ${release.title}`"
          >
            <Save v-if="!isSubmitting" class="h-4 w-4 mr-2" aria-hidden="true" />
            <span v-else class="animate-spin mr-2" aria-hidden="true">⏳</span>
            {{ isSubmitting ? 'Guardando...' : 'Guardar' }}
          </Button>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>

