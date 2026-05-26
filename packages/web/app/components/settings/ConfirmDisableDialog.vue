<script setup lang="ts">
import { AlertTriangle, X, Power } from 'lucide-vue-next';

interface Props {
  open: boolean;
  moduleName: string | null;
  saving: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

const titleId = 'confirm-disable-dialog-title';

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('cancel');
}

function lockScroll(lock: boolean) {
  if (!import.meta.client) return;
  if (lock) {
    document.addEventListener('keydown', onKeydown);
    document.body.style.overflow = 'hidden';
  } else {
    document.removeEventListener('keydown', onKeydown);
    document.body.style.overflow = '';
  }
}

watch(
  () => props.open,
  (isOpen) => {
    lockScroll(isOpen);
  },
);

onBeforeUnmount(() => lockScroll(false));
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-100 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md overflow-y-auto motion-safe:animate-in motion-safe:fade-in motion-safe:duration-150"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
    >
      <Card
        class="relative w-full max-w-md my-auto flex flex-col max-h-[90dvh] overflow-hidden rounded-none border-2 border-destructive/40 shadow-[0_0_0_1px_oklch(0.55_0.18_25/0.25),0_0_60px_-14px_oklch(0.65_0.2_25/0.5)] motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-200"
      >
        <!-- Arcade neon strip (destructive hue) -->
        <div
          class="h-1 shrink-0 bg-gradient-to-r from-destructive via-exp-hard to-destructive"
          aria-hidden="true"
        />

        <CardHeader
          class="shrink-0 flex flex-row items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-destructive/30"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <AlertTriangle
              class="h-5 w-5 shrink-0 text-exp-hard drop-shadow-[0_0_6px_oklch(0.7_0.2_60)]"
              aria-hidden="true"
            />
            <CardTitle
              :id="titleId"
              class="font-pixel text-xs sm:text-sm uppercase tracking-wider text-foreground [text-shadow:_0_0_12px_oklch(0.7_0.2_25_/_0.4)] truncate"
            >
              Confirmar desactivación
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-none hover:bg-destructive/10 hover:text-destructive cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-destructive"
            aria-label="Cancelar"
            @click="emit('cancel')"
          >
            <X class="h-4 w-4" aria-hidden="true" />
          </Button>
        </CardHeader>

        <CardContent class="flex-1 min-h-0 overflow-y-auto pt-4 sm:pt-6 space-y-4">
          <p class="text-sm sm:text-base text-muted-foreground">
            ¿Estás seguro que quieres desactivar el módulo
            <span class="font-semibold text-foreground">{{ moduleName }}</span
            >?
          </p>
          <p class="text-xs sm:text-sm text-muted-foreground/70">
            Podrás reactivarlo en cualquier momento desde esta página.
          </p>
        </CardContent>

        <CardFooter class="shrink-0 bg-card flex gap-2 pt-4 border-t border-destructive/30">
          <Button
            variant="outline"
            class="flex-1 rounded-none border-2 font-pixel text-[10px] uppercase cursor-pointer hover:bg-muted/50 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            :disabled="saving"
            @click="emit('cancel')"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            class="flex-1 rounded-none font-pixel text-[10px] uppercase cursor-pointer focus-visible:ring-2 focus-visible:ring-destructive"
            :disabled="saving"
            @click="emit('confirm')"
          >
            <Power v-if="!saving" class="h-4 w-4 mr-2" aria-hidden="true" />
            <div
              v-else
              class="animate-spin w-4 h-4 border-2 border-destructive-foreground border-t-transparent rounded-full mr-2"
              aria-hidden="true"
            />
            Desactivar
          </Button>
        </CardFooter>
      </Card>
    </div>
  </Teleport>
</template>
