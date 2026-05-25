<script setup lang="ts">
import { Calendar, Flame, Timer } from 'lucide-vue-next';
import StatCard from '@/components/index/StatCard.vue';

interface Props {
  weeklyCount: number;
  totalCount: number;
  weeklyMinutes: number;
}

defineProps<Props>();
</script>

<template>
  <div class="grid grid-cols-3 gap-2 sm:gap-3">
    <StatCard label="ESTA SEMANA" :value="weeklyCount" :icon="Calendar" color-variant="primary" />
    <StatCard label="TOTAL" :value="totalCount" :icon="Flame" color-variant="exp-easy" />
    <StatCard label="MIN. SEMANA" :value="weeklyMinutes" :icon="Timer" color-variant="accent" />
  </div>
</template>
