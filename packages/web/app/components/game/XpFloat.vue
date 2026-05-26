<script setup lang="ts">
import type { XpFloat } from '~~/stores/useCelebrations';
import { useCelebrationsStore } from '~~/stores/useCelebrations';

const props = defineProps<{ float: XpFloat }>();

const celebrations = useCelebrationsStore();
const floatRef = ref<HTMLElement | null>(null);

onMounted(() => {
  if (!import.meta.client) return;

  import('gsap').then(({ default: gsap }) => {
    if (!floatRef.value) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          floatRef.value,
          { opacity: 1, y: 0 },
          {
            opacity: 0,
            y: -60,
            duration: 1.2,
            ease: 'power2.out',
            onComplete: () => celebrations.removeFloat(props.float.id),
          },
        );
      });

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.to(floatRef.value, {
          opacity: 0,
          duration: 0.4,
          delay: 0.8,
          onComplete: () => celebrations.removeFloat(props.float.id),
        });
      });
    }, floatRef.value);

    onUnmounted(() => {
      ctx.revert();
    });
  });
});
</script>

<template>
  <div
    ref="floatRef"
    class="fixed right-4 bottom-20 z-[110] pointer-events-none select-none"
    aria-hidden="true"
  >
    <span class="font-pixel text-sm text-primary glow-primary">+{{ props.float.amount }} XP</span>
  </div>
</template>
