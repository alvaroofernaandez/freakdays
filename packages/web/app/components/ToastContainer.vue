<script setup lang="ts">
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-vue-next'
import { useToast, type ToastType } from '@/composables/useToast'

const { toasts, remove } = useToast()

const iconMap: Record<ToastType, any> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
}

const colorMap: Record<ToastType, string> = {
  success: 'bg-exp-easy/20 text-exp-easy border-exp-easy/30',
  error: 'bg-destructive/20 text-destructive border-destructive/30',
  info: 'bg-primary/20 text-primary border-primary/30',
  warning: 'bg-exp-medium/20 text-exp-medium border-exp-medium/30',
}
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <div class="fixed top-4 right-4 z-100 flex flex-col gap-2 pointer-events-none max-w-sm w-full sm:w-auto">
        <TransitionGroup
          name="toast"
          tag="div"
          class="flex flex-col gap-2"
        >
          <div
            v-for="toast in toasts"
            :key="toast.id"
            class="pointer-events-auto"
          >
            <div
              :class="[
                'flex items-center gap-3 p-4 rounded-lg border backdrop-blur-sm shadow-lg animate-in slide-in-from-right',
                colorMap[toast.type]
              ]"
            >
              <component :is="iconMap[toast.type]" class="h-5 w-5 shrink-0" />
              <p class="text-sm font-medium flex-1">{{ toast.message }}</p>
              <button
                @click="remove(toast.id)"
                class="shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
              >
                <X class="h-4 w-4" />
              </button>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </Teleport>
  </ClientOnly>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>

