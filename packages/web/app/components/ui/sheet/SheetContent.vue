<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Button } from '@/components/ui/button';
import { X } from 'lucide-vue-next';
import { DialogClose, DialogContent, DialogOverlay, DialogPortal } from 'radix-vue';
import { cn } from '@/lib/utils'

defineOptions({
  inheritAttrs: false,
})

interface Props {
  side?: 'top' | 'right' | 'bottom' | 'left'
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  side: 'right',
})

const sideClasses = {
  top: 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
  right: 'inset-y-0 right-0 h-full w-full sm:w-[400px] border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
  bottom: 'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
  left: 'inset-y-0 left-0 h-full w-full sm:w-[400px] border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
}
</script>

<template>
  <DialogPortal>
    <DialogOverlay
      class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogContent :class="cn(
      'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
      sideClasses[side],
      props.class,
    )">
      <slot />
      <DialogClose as-child>
        <Button variant="ghost" size="icon"
          class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary touch-manipulation"
          aria-label="Cerrar">
          <X class="h-4 w-4" />
          <span class="sr-only">Cerrar</span>
        </Button>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
