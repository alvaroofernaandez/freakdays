<script setup lang="ts">
import { Sun, Moon, Monitor } from 'lucide-vue-next';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useColorMode } from '@/composables/useColorMode';

const { mode, setMode } = useColorMode();

const options = [
  { value: 'light' as const, icon: Sun, label: 'Modo claro' },
  { value: 'dark' as const, icon: Moon, label: 'Modo oscuro' },
  { value: 'system' as const, icon: Monitor, label: 'Seguir sistema' },
] as const;

function cycle() {
  const idx = options.findIndex((o) => o.value === mode.value);
  const next = options[(idx + 1) % options.length];
  if (next) setMode(next.value);
}

const current = computed(() => options.find((o) => o.value === mode.value) ?? options[1]!);
</script>

<template>
  <Tooltip>
    <TooltipTrigger as-child>
      <button
        type="button"
        class="inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        :aria-label="current.label"
        @click="cycle"
      >
        <component :is="current.icon" class="h-4 w-4" aria-hidden="true" />
      </button>
    </TooltipTrigger>
    <TooltipContent>
      <p>{{ current.label }}</p>
    </TooltipContent>
  </Tooltip>
</template>
