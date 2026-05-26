<script setup lang="ts">
import { usePageTransition } from '@/composables/usePageTransition';
import CelebrationHost from '@/components/game/CelebrationHost.vue';
import ArcadeMenu from '@/components/game/ArcadeMenu.vue';
import { useArcadeMenuStore } from '~~/stores/useArcadeMenu';

const auth = useAuth();
const { arcadeTransition } = usePageTransition();
const arcadeMenuStore = useArcadeMenuStore();

onMounted(() => {
  auth.initialize();

  if (import.meta.client) {
    document.addEventListener('keydown', handleGlobalKeydown);
  }
});

onUnmounted(() => {
  if (import.meta.client) {
    document.removeEventListener('keydown', handleGlobalKeydown);
  }
});

function handleGlobalKeydown(e: KeyboardEvent) {
  // 'm' key opens arcade menu (ignore when focused on input/textarea/contenteditable)
  if (e.key === 'm' || e.key === 'M') {
    const target = e.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
    ) {
      return;
    }
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    arcadeMenuStore.toggle();
    return;
  }

  // Escape closes arcade menu (ArcadeMenu.vue also handles this but this is the global catch-all)
  if (e.key === 'Escape' && arcadeMenuStore.isOpen) {
    arcadeMenuStore.close();
  }
}
</script>

<template>
  <NuxtLayout>
    <NuxtPage :transition="arcadeTransition" />
  </NuxtLayout>
  <ToastContainer />
  <CelebrationHost />
  <ArcadeMenu />
</template>
