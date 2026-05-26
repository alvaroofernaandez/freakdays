<script setup lang="ts">
import type { AchievementCelebration } from '~~/stores/useCelebrations';

const props = defineProps<{ item: AchievementCelebration }>();
const emit = defineEmits<{ dismiss: [] }>();

const overlayRef = ref<HTMLElement | null>(null);

onMounted(() => {
  if (!import.meta.client) return;

  import('gsap').then(({ default: gsap }) => {
    if (!overlayRef.value) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from(overlayRef.value, {
          opacity: 0,
          y: -40,
          duration: 0.35,
          ease: 'back.out(1.4)',
        });
      });

      mm.add('(prefers-reduced-motion: reduce)', () => {
        if (overlayRef.value) {
          overlayRef.value.style.opacity = '1';
        }
      });
    }, overlayRef.value);

    onUnmounted(() => {
      ctx.revert();
    });
  });
});
</script>

<template>
  <div
    class="fixed inset-0 flex items-center justify-center z-[120]"
    role="dialog"
    aria-modal="true"
    aria-label="Logro desbloqueado"
  >
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="emit('dismiss')" />

    <!-- Panel -->
    <div
      ref="overlayRef"
      class="relative z-10 pixel-frame glass glow-accent p-8 text-center max-w-sm w-full mx-4"
    >
      <p class="font-pixel text-xs text-accent uppercase tracking-widest mb-2">
        ¡Logro desbloqueado!
      </p>
      <p v-if="props.item.icon" class="text-5xl mb-4" aria-hidden="true">{{ props.item.icon }}</p>
      <p class="font-pixel text-xl text-gradient font-bold mb-4">{{ props.item.name }}</p>
      <button class="btn-game text-sm px-6 py-2" @click="emit('dismiss')">Continuar</button>
    </div>
  </div>
</template>
