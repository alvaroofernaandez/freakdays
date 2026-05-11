<script setup lang="ts">
import type { Release, ReleaseType } from '@/composables/useCalendar';
import { MoreVertical, Trash2 } from 'lucide-vue-next';
import { onBeforeUnmount, onMounted } from 'vue';

interface Props {
  release: Release
  isDragging?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isDragging: false,
})

const emit = defineEmits<{
  delete: [id: string]
  deleteRequest: [release: Release]
  editRequest: [release: Release]
  dragstart: [id: string]
  dragend: []
}>()

const typeConfig: Record<ReleaseType, { color: string; bgColor: string; label: string }> = {
  anime_episode: {
    color: 'text-white',
    bgColor: 'bg-primary',
    label: 'Anime',
  },
  manga_volume: {
    color: 'text-white',
    bgColor: 'bg-exp-easy',
    label: 'Manga',
  },
  event: {
    color: 'text-white',
    bgColor: 'bg-exp-legendary',
    label: 'Evento',
  },
}

const config = computed(() => typeConfig[props.release.type])
const isHovered = ref(false)
const isDraggingLocal = ref(false)
const cardElement = ref<HTMLElement | null>(null)

const isMobile = computed(() => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 1024
})

function handleTouchStart() {
  isHovered.value = true
}

function handleTouchEnd() {
  isHovered.value = false
}

onMounted(() => {
  if (cardElement.value) {
    cardElement.value.addEventListener('touchstart', handleTouchStart, { passive: true })
    cardElement.value.addEventListener('touchend', handleTouchEnd, { passive: true })
  }
})

onBeforeUnmount(() => {
  if (cardElement.value) {
    cardElement.value.removeEventListener('touchstart', handleTouchStart)
    cardElement.value.removeEventListener('touchend', handleTouchEnd)
  }
})


function handleDelete(e: MouseEvent) {
  e.stopPropagation()
  e.preventDefault()
  emit('deleteRequest', props.release)
}

function handleEdit(e: MouseEvent) {
  e.stopPropagation()
  e.preventDefault()
  emit('editRequest', props.release)
}

function handleDragStart(e: DragEvent) {
  if (!e.dataTransfer) return

  isDraggingLocal.value = true
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.dropEffect = 'move'
  e.dataTransfer.setData('text/plain', props.release.id)
  e.dataTransfer.setData('application/json', JSON.stringify({ id: props.release.id }))

  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const computedStyle = getComputedStyle(target)

  const dragImage = target.cloneNode(true) as HTMLElement
  dragImage.style.position = 'fixed'
  dragImage.style.top = '-1000px'
  dragImage.style.left = '-1000px'
  dragImage.style.width = `${rect.width}px`
  dragImage.style.height = 'auto'
  dragImage.style.opacity = '0.9'
  dragImage.style.pointerEvents = 'none'
  dragImage.style.zIndex = '999999'
  dragImage.style.transform = 'none'
  dragImage.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.5)'

  document.body.appendChild(dragImage)

  const offsetX = e.offsetX || rect.width / 2
  const offsetY = e.offsetY || rect.height / 2

  e.dataTransfer.setDragImage(dragImage, offsetX, offsetY)

  setTimeout(() => {
    if (document.body.contains(dragImage)) {
      document.body.removeChild(dragImage)
    }
  }, 0)

  emit('dragstart', props.release.id)
  isHovered.value = false
}

function handleDragEnd() {
  isDraggingLocal.value = false
  emit('dragend')
  isHovered.value = false
}

function handleDragStartKeyboard(e: KeyboardEvent) {
  const fakeEvent = {
    ...e,
    dataTransfer: {
      effectAllowed: 'move',
      dropEffect: 'move',
      setData: () => { },
      getData: () => props.release.id,
    } as unknown as DataTransfer,
    currentTarget: e.currentTarget,
    offsetX: 0,
    offsetY: 0,
  } as unknown as DragEvent
  handleDragStart(fakeEvent)
}

function handleEditKeyboard(e: KeyboardEvent) {
  const fakeEvent = {
    ...e,
    stopPropagation: () => { },
    preventDefault: () => { },
  } as unknown as MouseEvent
  handleEdit(fakeEvent)
}

function handleDeleteKeyboard(e: KeyboardEvent) {
  const fakeEvent = {
    ...e,
    stopPropagation: () => { },
    preventDefault: () => { },
  } as unknown as MouseEvent
  handleDelete(fakeEvent)
}
</script>

<template>
  <div ref="cardElement" :id="`event-${release.id}`" :class="[
    'group cursor-grab active:cursor-grabbing touch-manipulation w-full',
    'rounded-lg transition-all duration-200 select-none',
    'active:scale-[0.98] sm:active:scale-100',
    'relative sm:absolute sm:left-0 sm:right-0',
    config.bgColor,
    (isDragging || isDraggingLocal) && 'opacity-40 cursor-grabbing scale-95',
    !isDragging && !isDraggingLocal && 'hover:opacity-90 hover:shadow-md focus-within:opacity-90 focus-within:shadow-md active:opacity-95',
  ]"
    :style="(isDragging || isDraggingLocal) ? { zIndex: 999999, position: 'relative' } : { zIndex: 50, position: 'relative' }"
    :draggable="!isMobile" role="button"
    :aria-label="`Evento: ${release.title}, ${config.label}. Arrastra para mover o presiona Enter para arrastrar.`"
    :aria-describedby="`event-${release.id}-description`" tabindex="0" @dragstart="handleDragStart"
    @dragend="handleDragEnd" @mouseenter="isHovered = true" @mouseleave="isHovered = false"
    @keydown.enter.prevent="handleDragStartKeyboard" @keydown.space.prevent="handleDragStartKeyboard">
    <div
      class="px-1.5 py-1 sm:px-1.5 sm:py-1 md:px-1.5 md:py-1 lg:px-2 lg:py-1.5 relative min-h-[32px] sm:min-h-[28px] md:min-h-[24px] lg:min-h-[32px] flex items-center">
      <span :id="`event-${release.id}-description`" class="sr-only">
        {{ config.label }} programado para {{ release.releaseDate.toLocaleDateString('es-ES', {
          day: 'numeric', month:
            'long', year: 'numeric'
        }) }}
      </span>
      <div class="flex items-center gap-1 sm:gap-0.5 md:gap-0.5 lg:gap-1 flex-1 min-w-0">
        <p :class="[
          'text-[9px] sm:text-[9px] md:text-[9px] lg:text-[10px] font-medium truncate leading-tight flex-1 min-w-0',
          config.color
        ]" :title="release.title" :aria-label="release.title">
          {{ release.title }}
        </p>
        <div
          class="flex items-center gap-0.5 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
          <button
            class="transition-all p-0.5 sm:p-0.5 md:p-0.5 lg:p-1 hover:bg-white/20 active:bg-white/30 rounded shrink-0 touch-manipulation min-h-[28px] min-w-[28px] sm:min-h-[24px] sm:min-w-[24px] md:min-h-[20px] md:min-w-[20px] lg:min-h-[24px] lg:min-w-[24px] flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent"
            :class="config.color" @click.stop="handleEdit" @keydown.enter.stop="handleEditKeyboard"
            @keydown.space.stop.prevent="handleEditKeyboard" :aria-label="`Editar evento: ${release.title}`"
            :aria-describedby="`event-${release.id}-description`" title="Editar evento">
            <MoreVertical class="h-2.5 sm:h-2.5 w-2.5 md:h-2.5 lg:h-3 lg:w-3" aria-hidden="true" />
            <span class="sr-only">Editar evento {{ release.title }}</span>
          </button>
          <button
            class="transition-all p-0.5 sm:p-0.5 md:p-0.5 lg:p-1 hover:bg-white/20 active:bg-white/30 rounded shrink-0 touch-manipulation min-h-[28px] min-w-[28px] sm:min-h-[24px] sm:min-w-[24px] md:min-h-[20px] md:min-w-[20px] lg:min-h-[24px] lg:min-w-[24px] flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent"
            :class="config.color" @click.stop="handleDelete" @keydown.enter.stop="handleDeleteKeyboard"
            @keydown.space.stop.prevent="handleDeleteKeyboard" :aria-label="`Eliminar evento: ${release.title}`"
            :aria-describedby="`event-${release.id}-description`" title="Eliminar evento">
            <Trash2 class="h-2.5 w-2.5 sm:h-2.5 md:h-2.5 lg:h-3 lg:w-3" aria-hidden="true" />
            <span class="sr-only">Eliminar evento {{ release.title }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
