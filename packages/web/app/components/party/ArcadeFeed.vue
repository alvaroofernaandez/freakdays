<script setup lang="ts">
import { useFeedStore } from '~~/stores/useFeed';
import { computed } from 'vue';

interface Props {
  partyId: string;
}

const props = defineProps<Props>();

const feedStore = useFeedStore();
const items = computed(() => feedStore.items);
const loading = computed(() => feedStore.loading);
const nextCursor = computed(() => feedStore.nextCursor);

function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    'level.up': '⬆️',
    'achievement.unlocked': '🏆',
    'quest.completed': '✅',
    'workout.logged': '💪',
  };
  return icons[type] ?? '📣';
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'level.up': 'subió de nivel',
    'achievement.unlocked': 'desbloqueó un logro',
    'quest.completed': 'completó una misión',
    'workout.logged': 'registró un entrenamiento',
  };
  return labels[type] ?? type;
}

function formatDate(isoString: string): string {
  try {
    return new Intl.DateTimeFormat('es', { dateStyle: 'short', timeStyle: 'short' }).format(
      new Date(isoString),
    );
  } catch {
    return isoString;
  }
}

async function loadMore() {
  await feedStore.fetchMore(props.partyId);
}
</script>

<template>
  <section aria-label="Activity feed">
    <h2 class="text-lg font-bold mb-3">Actividad reciente</h2>

    <div
      v-if="loading && items.length === 0"
      class="text-sm text-muted-foreground py-4 text-center"
    >
      Cargando actividad…
    </div>

    <div v-else-if="items.length === 0" class="text-sm text-muted-foreground py-4 text-center">
      No hay actividad reciente.
    </div>

    <ul v-else class="space-y-2">
      <li
        v-for="entry in items"
        :key="entry.id"
        class="flex items-start gap-3 p-3 rounded-md bg-muted/40"
      >
        <span class="text-xl leading-none mt-0.5" aria-hidden="true">{{
          getTypeIcon(entry.type)
        }}</span>
        <div class="flex-1 min-w-0">
          <p class="text-sm">
            <strong>{{ entry.actorName ?? entry.actorUserId }}</strong>
            {{ getTypeLabel(entry.type) }}
          </p>
          <time class="text-xs text-muted-foreground" :datetime="entry.createdAt">
            {{ formatDate(entry.createdAt) }}
          </time>
        </div>
      </li>
    </ul>

    <div v-if="nextCursor" class="mt-3 text-center">
      <button
        type="button"
        class="text-sm underline text-muted-foreground hover:text-foreground"
        :disabled="loading"
        @click="loadMore"
      >
        Cargar más
      </button>
    </div>
  </section>
</template>
