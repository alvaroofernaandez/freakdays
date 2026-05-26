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

interface VariantStyle {
  border: string;
  text: string;
  soft: string;
  bar: string;
  bracket: string;
  glow: string;
}

const colorMap: Record<string, VariantStyle> = {
  primary: {
    border: 'border-primary/40',
    text: 'text-primary',
    soft: 'bg-primary/15',
    bar: 'bg-primary',
    bracket: 'border-primary/60',
    glow: 'hover:shadow-[0_0_30px_-6px_var(--color-primary)]',
  },
  accent: {
    border: 'border-accent/40',
    text: 'text-accent',
    soft: 'bg-accent/15',
    bar: 'bg-accent',
    bracket: 'border-accent/60',
    glow: 'hover:shadow-[0_0_30px_-6px_var(--color-accent)]',
  },
  'exp-easy': {
    border: 'border-exp-easy/40',
    text: 'text-exp-easy',
    soft: 'bg-exp-easy/15',
    bar: 'bg-exp-easy',
    bracket: 'border-exp-easy/60',
    glow: 'hover:shadow-[0_0_30px_-6px_var(--color-exp-easy)]',
  },
  'exp-legendary': {
    border: 'border-exp-legendary/40',
    text: 'text-exp-legendary',
    soft: 'bg-exp-legendary/15',
    bar: 'bg-exp-legendary',
    bracket: 'border-exp-legendary/60',
    glow: 'hover:shadow-[0_0_30px_-6px_var(--color-exp-legendary)]',
  },
};

const colors = computed(() => colorMap[props.colorVariant] ?? colorMap.primary!);

// Arcade scoreboard style: pad numbers to 2 digits (0 -> "00", 7 -> "07").
const displayValue = computed(() =>
  typeof props.value === 'number' ? String(props.value).padStart(2, '0') : props.value,
);

const isEmpty = computed(() => {
  const n = typeof props.value === 'number' ? props.value : Number(props.value) || 0;
  return n === 0;
});

// Decorative power meter: fill cells proportionally to the count (capped).
const CELLS = 10;
const filledCells = computed(() => {
  const n = typeof props.value === 'number' ? props.value : Number(props.value) || 0;
  return Math.max(0, Math.min(n, CELLS));
});

const NOTCH =
  'polygon(0 4px,4px 4px,4px 0,calc(100% - 4px) 0,calc(100% - 4px) 4px,100% 4px,100% calc(100% - 4px),calc(100% - 4px) calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,4px calc(100% - 4px),0 calc(100% - 4px))';
</script>

<template>
  <Card
    :class="[
      'crt-scanlines group relative overflow-hidden rounded-none border-2 bg-card/40 transition-all duration-200',
      isEmpty ? 'border-border/30 opacity-80' : colors.border,
      isEmpty ? '' : colors.glow,
    ]"
  >
    <!-- HUD targeting brackets — muted when empty -->
    <span
      :class="[
        'absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2',
        isEmpty ? 'border-border/30' : colors.bracket,
      ]"
      aria-hidden="true"
    />
    <span
      :class="[
        'absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2',
        isEmpty ? 'border-border/30' : colors.bracket,
      ]"
      aria-hidden="true"
    />
    <span
      :class="[
        'absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2',
        isEmpty ? 'border-border/30' : colors.bracket,
      ]"
      aria-hidden="true"
    />
    <span
      :class="[
        'absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2',
        isEmpty ? 'border-border/30' : colors.bracket,
      ]"
      aria-hidden="true"
    />

    <CardContent class="relative p-5">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0 space-y-2">
          <p
            :class="[
              'flex items-center gap-1.5 font-pixel text-[8px] uppercase tracking-wider',
              isEmpty ? 'text-muted-foreground/40' : 'text-muted-foreground/80',
            ]"
          >
            <span
              :class="[
                'inline-block w-1.5 h-1.5',
                isEmpty ? 'bg-muted-foreground/20' : ['motion-safe:animate-pulse', colors.bar],
              ]"
              aria-hidden="true"
            />
            {{ label }}
          </p>
          <p
            :class="[
              'font-pixel text-3xl sm:text-4xl leading-none tabular-nums',
              isEmpty
                ? 'text-muted-foreground/30'
                : ['drop-shadow-[0_0_12px_currentColor]', colors.text],
            ]"
          >
            {{ displayValue }}
          </p>
          <!-- Empty-state hint -->
          <p v-if="isEmpty" class="font-pixel text-[7px] text-muted-foreground/40 uppercase">
            sin datos
          </p>
        </div>

        <div
          :class="[
            'pixelated grid place-items-center w-11 h-11 shrink-0 motion-safe:transition-transform motion-safe:duration-200 group-hover:scale-110',
            isEmpty ? 'bg-muted/20' : colors.soft,
          ]"
          :style="{ clipPath: NOTCH }"
          aria-hidden="true"
        >
          <component
            :is="icon"
            :class="['h-5 w-5', isEmpty ? 'text-muted-foreground/30' : colors.text]"
          />
        </div>
      </div>

      <!-- Decorative power meter -->
      <div class="mt-4 flex gap-1" aria-hidden="true">
        <span
          v-for="i in CELLS"
          :key="i"
          :class="[
            'h-1.5 flex-1 transition-colors duration-300',
            i <= filledCells ? (isEmpty ? 'bg-muted-foreground/20' : colors.bar) : 'bg-white/10',
          ]"
        />
      </div>
    </CardContent>
  </Card>
</template>
