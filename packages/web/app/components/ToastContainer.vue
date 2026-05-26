<script setup lang="ts">
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-vue-next';
import { useToast, type ToastType } from '@/composables/useToast';

const { toasts, remove } = useToast();

interface ToastStyle {
  icon: Component;
  label: string;
  border: string;
  text: string;
  bar: string;
  badge: string;
}

const styleMap: Record<ToastType, ToastStyle> = {
  success: {
    icon: CheckCircle2,
    label: 'ÉXITO',
    border: 'border-exp-easy/50',
    text: 'text-exp-easy',
    bar: 'bg-exp-easy',
    badge: 'bg-exp-easy/15 text-exp-easy',
  },
  error: {
    icon: XCircle,
    label: 'ERROR',
    border: 'border-destructive/60',
    text: 'text-destructive',
    bar: 'bg-destructive',
    badge: 'bg-destructive/15 text-destructive',
  },
  info: {
    icon: Info,
    label: 'INFO',
    border: 'border-primary/50',
    text: 'text-primary',
    bar: 'bg-primary',
    badge: 'bg-primary/15 text-primary',
  },
  warning: {
    icon: AlertTriangle,
    label: 'AVISO',
    border: 'border-exp-medium/50',
    text: 'text-exp-medium',
    bar: 'bg-exp-medium',
    badge: 'bg-exp-medium/15 text-exp-medium',
  },
};

const NOTCH =
  'polygon(0 4px,4px 4px,4px 0,calc(100% - 4px) 0,calc(100% - 4px) 4px,100% 4px,100% calc(100% - 4px),calc(100% - 4px) calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,4px calc(100% - 4px),0 calc(100% - 4px))';
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <div
        class="fixed top-4 right-4 z-100 flex flex-col gap-3 pointer-events-none max-w-sm w-[calc(100%-2rem)] sm:w-96"
      >
        <TransitionGroup name="toast" tag="div" class="flex flex-col gap-3">
          <div
            v-for="toast in toasts"
            :key="toast.id"
            class="pointer-events-auto glass border-2 rounded-none backdrop-blur-md flex items-stretch overflow-hidden shadow-[0_12px_40px_-12px_rgba(0,0,0,0.75)]"
            :class="styleMap[toast.type].border"
            :role="toast.type === 'error' ? 'alert' : 'status'"
            :aria-live="toast.type === 'error' ? 'assertive' : 'polite'"
          >
            <!-- type accent bar -->
            <span class="w-1.5 shrink-0" :class="styleMap[toast.type].bar" aria-hidden="true" />

            <div class="flex items-center gap-3 p-3.5 flex-1 min-w-0">
              <span
                class="pixelated grid place-items-center w-9 h-9 shrink-0"
                :class="styleMap[toast.type].badge"
                :style="{ clipPath: NOTCH }"
                aria-hidden="true"
              >
                <component :is="styleMap[toast.type].icon" class="h-5 w-5" />
              </span>

              <div class="flex-1 min-w-0">
                <p
                  class="font-pixel text-[8px] tracking-[0.15em] leading-none"
                  :class="styleMap[toast.type].text"
                >
                  {{ styleMap[toast.type].label }}
                </p>
                <p class="text-sm text-foreground mt-1.5 leading-snug break-words">
                  {{ toast.message }}
                </p>
              </div>

              <button
                type="button"
                aria-label="Cerrar notificación"
                class="btn-game shrink-0 grid place-items-center w-7 h-7 rounded-none text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                @click="remove(toast.id)"
              >
                <X class="h-4 w-4" aria-hidden="true" />
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
  transform: translateX(110%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(110%);
}

.toast-move {
  transition: transform 0.3s ease;
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active,
  .toast-move {
    transition: opacity 0.2s ease;
  }
  .toast-enter-from,
  .toast-leave-to {
    transform: none;
  }
}
</style>
