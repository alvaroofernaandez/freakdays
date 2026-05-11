<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, ZoomIn, ZoomOut, Move } from 'lucide-vue-next'

interface Props {
  open: boolean
  imageFile: File | null
  aspectRatio?: number
}

const props = withDefaults(defineProps<Props>(), {
  aspectRatio: 16 / 9,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'crop': [file: File]
  'cancel': []
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const imageRef = ref<HTMLImageElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)

const scale = ref(1)
const position = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const isProcessing = ref(false)

const imageUrl = computed(() => {
  if (!props.imageFile) return null
  return URL.createObjectURL(props.imageFile)
})

const containerWidth = ref(0)
const containerHeight = ref(0)

watch(() => props.open, (open) => {
  if (open && props.imageFile) {
    nextTick(() => {
      loadImage()
      updateContainerSize()
    })
  } else {
    resetState()
  }
})

watch(() => props.imageFile, () => {
  if (props.open && props.imageFile) {
    nextTick(() => {
      loadImage()
    })
  }
})

function updateContainerSize() {
  if (containerRef.value) {
    containerWidth.value = containerRef.value.clientWidth
    containerHeight.value = containerRef.value.clientHeight
  }
}

function resetState() {
  scale.value = 1
  position.value = { x: 0, y: 0 }
  isDragging.value = false
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value)
  }
}

function loadImage() {
  if (!imageRef.value || !props.imageFile) return

  const img = new Image()
  img.onload = () => {
    const containerAspect = containerWidth.value / containerHeight.value
    const imageAspect = img.width / img.height
    const targetAspect = props.aspectRatio

    let initialScale = 1
    if (imageAspect > targetAspect) {
      initialScale = containerHeight.value / img.height
    } else {
      initialScale = containerWidth.value / img.width
    }

    scale.value = Math.max(initialScale, 1)
    position.value = { x: 0, y: 0 }
  }
  img.src = imageUrl.value!
}

function handleZoomIn() {
  scale.value = Math.min(scale.value + 0.1, 3)
}

function handleZoomOut() {
  scale.value = Math.max(scale.value - 0.1, 0.5)
}

function handleMouseDown(e: MouseEvent) {
  isDragging.value = true
  dragStart.value = { x: e.clientX - position.value.x, y: e.clientY - position.value.y }
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging.value) return
  position.value = {
    x: e.clientX - dragStart.value.x,
    y: e.clientY - dragStart.value.y,
  }
}

function handleMouseUp() {
  isDragging.value = false
}

function handleTouchStart(e: TouchEvent) {
  if (e.touches.length === 1) {
    isDragging.value = true
    dragStart.value = {
      x: e.touches[0].clientX - position.value.x,
      y: e.touches[0].clientY - position.value.y,
    }
  }
}

function handleTouchMove(e: TouchEvent) {
  if (!isDragging.value || e.touches.length !== 1) return
  e.preventDefault()
  position.value = {
    x: e.touches[0].clientX - dragStart.value.x,
    y: e.touches[0].clientY - dragStart.value.y,
  }
}

function handleTouchEnd() {
  isDragging.value = false
}

async function handleCrop() {
  if (!canvasRef.value || !imageRef.value || !props.imageFile) return

  isProcessing.value = true
  try {
    const canvas = canvasRef.value
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const targetWidth = 1920
    const targetHeight = targetWidth / props.aspectRatio

    canvas.width = targetWidth
    canvas.height = targetHeight

    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = imageUrl.value!
    })

    const containerAspect = containerWidth.value / containerHeight.value
    const imageAspect = img.width / img.height

    let displayWidth = containerWidth.value
    let displayHeight = containerHeight.value

    if (imageAspect > containerAspect) {
      displayHeight = containerWidth.value / imageAspect
    } else {
      displayWidth = containerHeight.value * imageAspect
    }

    const scaledWidth = displayWidth * scale.value
    const scaledHeight = displayHeight * scale.value

    const offsetX = position.value.x
    const offsetY = position.value.y

    const sourceX = Math.max(0, (-offsetX / scaledWidth) * img.width)
    const sourceY = Math.max(0, (-offsetY / scaledHeight) * img.height)
    const sourceWidth = Math.min(img.width, (containerWidth.value / scaledWidth) * img.width)
    const sourceHeight = Math.min(img.height, (containerHeight.value / scaledHeight) * img.height)

    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      targetWidth,
      targetHeight
    )

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const croppedFile = new File([blob], props.imageFile!.name, {
            type: props.imageFile!.type,
          })
          emit('crop', croppedFile)
          emit('update:open', false)
        }
      },
      props.imageFile.type,
      0.9
    )
  } catch (error) {
    console.error('Error cropping image:', error)
  } finally {
    isProcessing.value = false
  }
}

function handleCancel() {
  emit('update:open', false)
  emit('cancel')
}

onMounted(() => {
  window.addEventListener('resize', updateContainerSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateContainerSize)
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value)
  }
})
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="open && imageFile"
          class="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 bg-background/95 backdrop-blur-sm overflow-y-auto"
          style="pointer-events: auto;"
          @click.self="handleCancel"
          @keydown.esc="handleCancel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="crop-title"
        >
          <Card class="w-full max-w-4xl shadow-xl border-2 my-auto" @click.stop>
            <CardHeader class="flex flex-row items-center justify-between pb-3 sm:pb-4 p-4 sm:p-6">
              <CardTitle id="crop-title" class="text-lg sm:text-xl flex items-center gap-2">
                <Move class="h-5 w-5 text-primary" />
                <span>Ajustar Banner</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                class="h-9 w-9 sm:h-8 sm:w-8 touch-manipulation"
                @click="handleCancel"
                aria-label="Cerrar"
              >
                <X class="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent class="p-4 sm:p-6 pt-0 space-y-4">
              <div class="space-y-2">
                <p class="text-sm text-muted-foreground">
                  Arrastra la imagen para posicionarla y usa los controles para ajustar el zoom
                </p>
              </div>

              <div
                ref="containerRef"
                class="relative w-full bg-muted/30 rounded-lg overflow-hidden border-2 border-border"
                :style="{ aspectRatio: `${aspectRatio}` }"
                @mousedown="handleMouseDown"
                @mousemove="handleMouseMove"
                @mouseup="handleMouseUp"
                @mouseleave="handleMouseUp"
                @touchstart="handleTouchStart"
                @touchmove="handleTouchMove"
                @touchend="handleTouchEnd"
              >
                <img
                  v-if="imageUrl"
                  ref="imageRef"
                  :src="imageUrl"
                  :alt="'Imagen de banner'"
                  class="absolute top-0 left-0 select-none pointer-events-none"
                  :style="{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    transformOrigin: 'center center',
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }"
                  draggable="false"
                />
                <div
                  class="absolute inset-0 border-2 border-dashed border-primary/50 pointer-events-none"
                />
              </div>

              <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    class="h-10 w-10 touch-manipulation"
                    @click="handleZoomOut"
                    aria-label="Alejar"
                  >
                    <ZoomOut class="h-4 w-4" />
                  </Button>
                  <span class="text-sm text-muted-foreground min-w-[60px] text-center">
                    {{ Math.round(scale * 100) }}%
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    class="h-10 w-10 touch-manipulation"
                    @click="handleZoomIn"
                    aria-label="Acercar"
                  >
                    <ZoomIn class="h-4 w-4" />
                  </Button>
                </div>

                <div class="flex gap-2">
                  <Button
                    variant="outline"
                    class="min-h-[44px] touch-manipulation"
                    @click="handleCancel"
                    :disabled="isProcessing"
                  >
                    Cancelar
                  </Button>
                  <Button
                    class="min-h-[44px] touch-manipulation glow-primary"
                    @click="handleCrop"
                    :disabled="isProcessing"
                  >
                    {{ isProcessing ? 'Procesando...' : 'Aplicar' }}
                  </Button>
                </div>
              </div>
            </CardContent>
            <canvas ref="canvasRef" class="hidden" />
          </Card>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>

