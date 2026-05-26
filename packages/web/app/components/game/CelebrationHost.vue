<script setup lang="ts">
import { useCelebrationsStore } from '~~/stores/useCelebrations';
import LevelUpOverlay from './LevelUpOverlay.vue';
import AchievementOverlay from './AchievementOverlay.vue';
import XpFloat from './XpFloat.vue';
import type { LevelUpCelebration, AchievementCelebration } from '~~/stores/useCelebrations';

const celebrations = useCelebrationsStore();

let dismissTimer: ReturnType<typeof setTimeout> | null = null;

function clearTimer() {
  if (dismissTimer !== null) {
    clearTimeout(dismissTimer);
    dismissTimer = null;
  }
}

function scheduleAutoDismiss() {
  clearTimer();
  if (celebrations.current) {
    dismissTimer = setTimeout(() => {
      celebrations.dismiss();
    }, 3500);
  }
}

watch(
  () => celebrations.current,
  (item) => {
    if (item) {
      scheduleAutoDismiss();
    } else {
      clearTimer();
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  clearTimer();
});

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && celebrations.current) {
    celebrations.dismiss();
  }
}

onMounted(() => {
  if (import.meta.client) {
    document.addEventListener('keydown', handleKeydown);
  }
});

onUnmounted(() => {
  if (import.meta.client) {
    document.removeEventListener('keydown', handleKeydown);
  }
});

const announcementText = computed(() => {
  const item = celebrations.current;
  if (!item) return '';
  if (item.kind === 'level_up') return `¡Nivel ${item.level}!`;
  return `¡Logro desbloqueado: ${item.name}!`;
});
</script>

<template>
  <div role="status" aria-live="polite" class="pointer-events-none">
    <!-- Screen reader announcement -->
    <span class="sr-only">{{ announcementText }}</span>

    <!-- Modal lane: one celebration at a time -->
    <Teleport to="body">
      <template v-if="celebrations.current">
        <LevelUpOverlay
          v-if="celebrations.current.kind === 'level_up'"
          :item="celebrations.current as LevelUpCelebration"
          @dismiss="celebrations.dismiss()"
        />
        <AchievementOverlay
          v-else-if="celebrations.current.kind === 'achievement'"
          :item="celebrations.current as AchievementCelebration"
          @dismiss="celebrations.dismiss()"
        />
      </template>

      <!-- Float lane: concurrent XP floats -->
      <template v-for="float in celebrations.floats" :key="float.id">
        <XpFloat :float="float" />
      </template>
    </Teleport>
  </div>
</template>
