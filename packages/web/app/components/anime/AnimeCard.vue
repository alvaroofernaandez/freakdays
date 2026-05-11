<script setup lang="ts">
import { Tv, Plus, Minus, Trash2, Star, Calendar, RotateCcw, FileText, ChevronDown, ChevronUp, CheckCircle2, BookOpen, Globe, Tag, BarChart3, Link } from 'lucide-vue-next'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import type { AnimeEntry, AnimeStatus } from '@/composables/useAnime'

interface Props {
  anime: AnimeEntry
}

const props = defineProps<Props>()

const emit = defineEmits<{
  increment: [anime: AnimeEntry]
  decrement: [anime: AnimeEntry]
  delete: [id: string]
  changeStatus: [anime: AnimeEntry, status: AnimeStatus]
}>()

const showDetails = ref(false)

const progress = computed(() => {
  if (!props.anime.totalEpisodes) return 0
  return Math.round((props.anime.currentEpisode / props.anime.totalEpisodes) * 100)
})

const synopsis = computed(() => {
  const notes = props.anime.notes
  if (!notes) return null
  const synopsisMatch = notes.match(/Sinopsis:\s*([\s\S]*?)(?=\n\n|Título japonés:|Géneros:|Información:|MyAnimeList ID:|$)/)
  return synopsisMatch?.[1]?.trim() ?? null
})

const formattedStartDate = computed(() => {
  if (!props.anime.startDate) return null
  return new Date(props.anime.startDate).toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
})

const formattedEndDate = computed(() => {
  if (!props.anime.endDate) return null
  return new Date(props.anime.endDate).toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
})

const hasAdditionalInfo = computed(() => {
  return props.anime.startDate || props.anime.endDate || props.anime.rewatchCount > 0 || synopsis.value
})
</script>

<template>
  <Card class="group hover:border-primary/30 transition-all overflow-hidden">
    <div class="flex gap-4 p-4">
      <div class="relative w-20 h-28 sm:w-24 sm:h-32 rounded-lg overflow-hidden shrink-0 bg-muted">
        <img
          v-if="anime.coverUrl"
          :src="anime.coverUrl"
          :alt="anime.title"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div v-else class="w-full h-full flex items-center justify-center">
          <Tv class="h-8 w-8 text-muted-foreground/50" />
        </div>
        <div v-if="anime.status === 'watching' && anime.totalEpisodes" class="absolute bottom-0 left-0 right-0 h-1 bg-background/50">
          <div 
            class="h-full bg-primary transition-all duration-300"
            :style="{ width: `${progress}%` }"
          />
        </div>
      </div>
      
      <div class="flex-1 min-w-0 space-y-2">
        <div>
          <h3 class="font-semibold text-sm sm:text-base line-clamp-2 group-hover:text-primary transition-colors">
            {{ anime.title }}
          </h3>
          <div class="flex items-center gap-2 mt-1 flex-wrap">
            <Badge :variant="anime.status === 'completed' ? 'default' : 'outline'" class="text-[10px]">
              {{ anime.status === 'watching' ? 'En curso' : 
                 anime.status === 'completed' ? 'Visto' :
                 anime.status === 'on_hold' ? 'En pausa' :
                 anime.status === 'dropped' ? 'Droppeado' : 'Pendiente' }}
            </Badge>
            <div v-if="anime.score" class="flex items-center gap-1 text-xs text-exp-legendary">
              <Star class="h-3 w-3 fill-current" />
              <span class="font-medium">{{ anime.score }}/10</span>
            </div>
            <div v-if="anime.rewatchCount > 0" class="flex items-center gap-1 text-xs text-muted-foreground">
              <RotateCcw class="h-3 w-3" />
              <span>{{ anime.rewatchCount }}x</span>
            </div>
          </div>
        </div>

        <div v-if="anime.status === 'completed'" class="flex items-center gap-2 text-xs sm:text-sm">
          <Tooltip>
            <TooltipTrigger as-child>
              <div class="flex items-center gap-1.5 px-2 py-1 rounded-md bg-exp-easy/20 text-exp-easy cursor-help">
                <CheckCircle2 class="h-3.5 w-3.5 fill-current" />
                <span class="font-medium">Completado</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Anime completado</p>
            </TooltipContent>
          </Tooltip>
          <span v-if="anime.totalEpisodes" class="text-muted-foreground">
            {{ anime.totalEpisodes }} episodios
          </span>
        </div>

        <div v-else class="space-y-1">
          <div class="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <span class="font-medium">Ep. {{ anime.currentEpisode }}</span>
            <span v-if="anime.totalEpisodes">/ {{ anime.totalEpisodes }}</span>
            <span v-if="anime.totalEpisodes" class="text-muted-foreground/70">
              ({{ progress }}%)
            </span>
          </div>
          <div v-if="anime.totalEpisodes" class="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              class="h-full bg-primary transition-all duration-300"
              :style="{ width: `${progress}%` }"
            />
          </div>
        </div>

        <div v-if="formattedStartDate || formattedEndDate" class="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <div v-if="formattedStartDate" class="flex items-center gap-1">
            <Calendar class="h-3 w-3" />
            <span>Inicio: {{ formattedStartDate }}</span>
          </div>
          <div v-if="formattedEndDate" class="flex items-center gap-1">
            <Calendar class="h-3 w-3" />
            <span>Fin: {{ formattedEndDate }}</span>
          </div>
        </div>

        <div v-if="synopsis || hasAdditionalInfo" class="pt-1">
          <Button
            variant="ghost"
            size="sm"
            class="h-7 text-xs text-muted-foreground hover:text-foreground"
            @click="showDetails = !showDetails"
          >
            <ChevronDown v-if="!showDetails" class="h-3 w-3 mr-1" />
            <ChevronUp v-else class="h-3 w-3 mr-1" />
            {{ showDetails ? 'Ocultar' : 'Ver más' }} detalles
          </Button>
        </div>

        <Transition name="slide-down">
          <div v-if="showDetails" class="space-y-2 pt-2 border-t border-border">
            <div v-if="synopsis" class="text-xs text-muted-foreground">
              <div class="flex items-start gap-2">
                <FileText class="h-3 w-3 mt-0.5 shrink-0" />
                <p class="line-clamp-4">{{ synopsis }}</p>
              </div>
            </div>
            <div v-if="anime.notes && !synopsis" class="text-xs text-muted-foreground">
              <div class="flex items-start gap-2">
                <FileText class="h-3 w-3 mt-0.5 shrink-0" />
                <p class="line-clamp-3 whitespace-pre-wrap">{{ anime.notes }}</p>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <div class="flex flex-col items-end gap-1 shrink-0">
        <div v-if="anime.status === 'watching'" class="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger as-child>
              <Button 
                variant="ghost" 
                size="icon" 
                class="h-8 w-8"
                :disabled="anime.currentEpisode <= 0"
                @click="emit('decrement', anime)"
              >
                <Minus class="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Decrementar episodio</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger as-child>
              <Button 
                variant="ghost" 
                size="icon" 
                class="h-8 w-8"
                :disabled="anime.totalEpisodes ? anime.currentEpisode >= anime.totalEpisodes : false"
                @click="emit('increment', anime)"
              >
                <Plus class="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Incrementar episodio</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button 
              variant="ghost" 
              size="icon" 
              class="h-8 w-8 text-muted-foreground hover:text-destructive"
              @click="emit('delete', anime.id)"
            >
              <Trash2 class="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Eliminar anime</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
  max-height: 500px;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}
</style>

