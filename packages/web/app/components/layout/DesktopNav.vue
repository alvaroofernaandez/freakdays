<script setup lang="ts">
import type { Component } from 'vue';

interface NavItem {
  to: string;
  icon: Component;
  label: string;
}

interface Props {
  items: NavItem[];
  isActive: (to: string) => boolean;
}

defineProps<Props>();
</script>

<template>
  <ClientOnly>
    <nav
      class="ml-4 md:ml-6 lg:ml-8 flex items-center gap-0.5 overflow-x-auto scrollbar-hide"
      style="position: relative; z-index: 10000"
    >
      <NuxtLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="relative flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-none border-2 transition-all duration-150 group/nav whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style="position: relative; z-index: 10001; pointer-events: auto !important"
        :class="
          isActive(item.to)
            ? 'text-primary border-primary/60 bg-primary/10'
            : 'text-muted-foreground border-transparent hover:border-primary/30 hover:bg-primary/5 hover:text-foreground'
        "
      >
        <component
          :is="item.icon"
          class="h-3.5 w-3.5 shrink-0"
          :class="isActive(item.to) ? 'text-primary' : ''"
          aria-hidden="true"
        />
        <span class="font-pixel text-[9px] uppercase hidden sm:inline">{{ item.label }}</span>
      </NuxtLink>
    </nav>
  </ClientOnly>
</template>
