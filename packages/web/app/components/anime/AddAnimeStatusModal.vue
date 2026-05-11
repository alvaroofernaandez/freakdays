<script setup lang="ts">
import { Play, CheckCircle2, Pause, X, Tv } from 'lucide-vue-next'
import type { AnimeStatus } from '@/composables/useAnime'
import type { AnimeSearchResult } from '@/composables/useAnimeSearch'

interface Props {
  anime: AnimeSearchResult | null
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  confirm: [status: AnimeStatus]
}>()

const selectedStatus = ref<AnimeStatus>('plan_to_watch')

const statusOptions: Array<{ value: AnimeStatus; label: string; icon: any; color: string; description: string }> = [
  { 
    value: 'plan_to_watch', 
    label: 'Pendiente', 
    icon: Tv, 
    color: 'text-muted-foreground',
    description: 'Animes que planeas ver'
  },
  { 
    value: 'watching', 
    label: 'En curso', 
    icon: Play, 
    color: 'text-primary',
    description: 'Animes que estás viendo actualmente'
  },
  { 
    value: 'completed', 
    label: 'Visto', 
    icon: CheckCircle2, 
    color: 'text-exp-easy',
    description: 'Animes que ya terminaste'
  },
  { 
    value: 'on_hold', 
    label: 'En pausa', 
    icon: Pause, 
    color: 'text-exp-medium',
    description: 'Animes que pausaste temporalmente'
  },
  { 
    value: 'dropped', 
    label: 'Droppeado', 
    icon: X, 
    color: 'text-destructive',
    description: 'Animes que dejaste de ver'
  },
]

const displayTitle = computed(() => 
  props.anime?.title_english || props.anime?.title || ''
)

const coverUrl = computed(() => 
  props.anime?.images?.jpg?.large_image_url || 
  props.anime?.images?.jpg?.image_url || 
  props.anime?.images?.webp?.large_image_url ||
  null
)

function handleConfirm() {
  emit('confirm', selectedStatus.value)
  emit('close')
}

function handleCancel() {
  emit('close')
}

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    selectedStatus.value = 'plan_to_watch'
  }
})
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/95 backdrop-blur-sm overflow-y-auto" @click.self="handleCancel">
    <Card class="w-full max-w-md my-auto shadow-xl border-2">
      <CardHeader class="flex flex-row items-center justify-between pb-3 sm:pb-4 border-b">
        <div class="flex items-center gap-2">
          <Tv class="h-5 w-5 text-primary" />
          <CardTitle class="text-lg sm:text-xl">Añadir Anime</CardTitle>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          class="h-8 w-8 sm:h-9 sm:w-9 hover:bg-muted hover:text-foreground cursor-pointer" 
          @click="handleCancel"
        >
          <X class="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent class="space-y-4 pt-4 sm:pt-6">
        <CardDescription class="text-sm text-muted-foreground mb-4">
          Selecciona el estado inicial para este anime
        </CardDescription>

        <div v-if="anime" class="flex gap-3 p-3 rounded-lg bg-muted/50">
          <div class="relative w-16 h-24 rounded overflow-hidden shrink-0 bg-muted">
            <img
              v-if="coverUrl"
              :src="coverUrl"
              :alt="displayTitle"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <Tv class="h-6 w-6 text-muted-foreground/50" />
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-sm line-clamp-2">
              {{ displayTitle }}
            </h3>
            <p v-if="anime.title_japanese && anime.title_japanese !== anime.title" class="text-xs text-muted-foreground mt-0.5">
              {{ anime.title_japanese }}
            </p>
          </div>
        </div>

        <div class="space-y-2">
          <Label class="text-sm font-medium">Estado inicial</Label>
          <div class="grid grid-cols-1 gap-2">
            <button
              v-for="option in statusOptions"
              :key="option.value"
              type="button"
              :class="[
                'flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left cursor-pointer',
                selectedStatus === option.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              ]"
              @click="selectedStatus = option.value"
            >
              <component
                :is="option.icon"
                :class="['h-5 w-5 shrink-0 mt-0.5', option.color]"
              />
              <div class="flex-1 min-w-0">
                <div class="font-medium text-sm">{{ option.label }}</div>
                <div class="text-xs text-muted-foreground mt-0.5">
                  {{ option.description }}
                </div>
              </div>
              <div
                v-if="selectedStatus === option.value"
                class="h-4 w-4 rounded-full bg-primary shrink-0 flex items-center justify-center mt-0.5"
              >
                <div class="h-2 w-2 rounded-full bg-primary-foreground" />
              </div>
            </button>
          </div>
        </div>
      </CardContent>

      <CardFooter class="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" @click="handleCancel">
          Cancelar
        </Button>
        <Button @click="handleConfirm">
          Añadir Anime
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>

