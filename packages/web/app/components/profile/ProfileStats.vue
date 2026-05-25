<script setup lang="ts">
import { Calendar, Sparkles, Target, Trophy } from 'lucide-vue-next';
import StatCard from '@/components/index/StatCard.vue';

interface Props {
  level: number;
  totalExp: number;
  currentExp: number;
  neededExp: number;
}

const props = defineProps<Props>();

const toNextLevel = computed(() => Math.max(0, props.neededExp - props.currentExp));
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
    <StatCard label="NIVEL" :value="level" :icon="Sparkles" color-variant="primary" />
    <StatCard label="EXP TOTAL" :value="totalExp" :icon="Trophy" color-variant="exp-legendary" />
    <StatCard label="EXP NIVEL" :value="currentExp" :icon="Target" color-variant="accent" />
    <StatCard label="PARA SUBIR" :value="toNextLevel" :icon="Calendar" color-variant="exp-easy" />
  </div>
</template>
