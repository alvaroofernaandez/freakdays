<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next';
import type { AppModule } from '~~/domain/types';
import { getModuleIcon } from '~~/domain/constants/module-icons';

interface Props {
  module: AppModule;
}

defineProps<Props>();
</script>

<template>
  <Card
    class="relative h-full border-2 border-border/50 hover:border-primary/70 shadow-[0_5px_0_0_oklch(0.42_0.16_290)] hover:shadow-[0_5px_0_0_oklch(0.52_0.2_290)] hover:brightness-105 active:translate-y-[4px] active:shadow-[0_1px_0_0_oklch(0.42_0.16_290)] transition-[transform,filter,box-shadow,border-color] duration-100 motion-reduce:active:translate-y-0 overflow-hidden group cursor-pointer"
  >
    <div
      class="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-0"
    />
    <CardHeader class="pb-3 relative z-10">
      <div class="flex items-center gap-3">
        <!-- Notched icon box -->
        <div
          class="pixelated relative flex-shrink-0 grid place-items-center w-12 h-12 transition-colors duration-200 bg-primary/15 group-hover:bg-primary/25 [clip-path:polygon(0_4px,4px_4px,4px_0,calc(100%-4px)_0,calc(100%-4px)_4px,100%_4px,100%_calc(100%-4px),calc(100%-4px)_calc(100%-4px),calc(100%-4px)_100%,4px_100%,4px_calc(100%-4px),0_calc(100%-4px))]"
          aria-hidden="true"
        >
          <component
            :is="getModuleIcon(module.icon)"
            class="h-6 w-6 text-primary group-hover:text-accent transition-colors"
          />
        </div>

        <div class="flex-1 min-w-0">
          <CardTitle
            class="text-base font-semibold truncate mb-0.5 group-hover:text-primary transition-colors"
            >{{ module.name }}</CardTitle
          >
          <CardDescription class="text-xs line-clamp-2">{{ module.description }}</CardDescription>
        </div>

        <ChevronRight
          class="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0"
          aria-hidden="true"
        />
      </div>
    </CardHeader>
  </Card>
</template>
