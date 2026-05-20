<script setup lang="ts">
import type { Component } from 'vue';
import { computed } from 'vue';
import { Card, CardContent } from '@/components/ui/card';

const props = defineProps<{
  label: string;
  value: number | string;
  icon: Component;
  colorVariant: 'primary' | 'accent' | 'exp-easy' | 'exp-legendary';
}>();

const colorMap = {
  primary: {
    card: 'border-primary/30 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10',
    overlay: 'bg-gradient-to-br from-primary/5 to-transparent',
    blob: 'bg-primary/20',
    text: 'text-primary',
    iconBg: 'bg-primary/20 border-primary/30 group-hover:bg-primary/30',
  },
  accent: {
    card: 'border-accent/30 bg-gradient-to-br from-accent/15 via-accent/10 to-accent/5 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10',
    overlay: 'bg-gradient-to-br from-accent/5 to-transparent',
    blob: 'bg-accent/20',
    text: 'text-accent',
    iconBg: 'bg-accent/20 border-accent/30 group-hover:bg-accent/30',
  },
  'exp-easy': {
    card: 'border-exp-easy/30 bg-gradient-to-br from-exp-easy/15 via-exp-easy/10 to-exp-easy/5 hover:border-exp-easy/50 hover:shadow-lg hover:shadow-exp-easy/10',
    overlay: 'bg-gradient-to-br from-exp-easy/5 to-transparent',
    blob: 'bg-exp-easy/20',
    text: 'text-exp-easy',
    iconBg: 'bg-exp-easy/20 border-exp-easy/30 group-hover:bg-exp-easy/30',
  },
  'exp-legendary': {
    card: 'border-exp-legendary/30 bg-gradient-to-br from-exp-legendary/15 via-exp-legendary/10 to-exp-legendary/5 hover:border-exp-legendary/50 hover:shadow-lg hover:shadow-exp-legendary/10',
    overlay: 'bg-gradient-to-br from-exp-legendary/5 to-transparent',
    blob: 'bg-exp-legendary/20',
    text: 'text-exp-legendary',
    iconBg: 'bg-exp-legendary/20 border-exp-legendary/30 group-hover:bg-exp-legendary/30',
  },
};

const colors = computed(() => colorMap[props.colorVariant]);
</script>

<template>
  <Card :class="['group relative overflow-hidden transition-all duration-300', colors.card]">
    <div
      :class="[
        'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
        colors.overlay,
      ]"
    />
    <div
      :class="[
        'absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-300',
        colors.blob,
      ]"
    />
    <CardContent class="relative p-6 sm:p-7">
      <div class="flex flex-col h-full min-h-[120px] sm:min-h-[140px]">
        <div class="flex-1 space-y-2">
          <p class="text-sm font-medium text-muted-foreground/90 uppercase tracking-wide">
            {{ label }}
          </p>
          <p :class="['text-4xl sm:text-5xl font-bold leading-none', colors.text]">
            {{ value }}
          </p>
        </div>
        <div class="flex justify-end mt-auto">
          <div
            :class="[
              'w-14 h-14 sm:w-16 sm:h-16 rounded-full backdrop-blur-sm border flex items-center justify-center group-hover:scale-110 transition-all duration-300',
              colors.iconBg,
            ]"
          >
            <component :is="icon" :class="['h-7 w-7 sm:h-8 sm:w-8', colors.text]" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
