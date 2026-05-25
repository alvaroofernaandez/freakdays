<script setup lang="ts">
import { Menu } from 'lucide-vue-next';
import type { Component } from 'vue';

interface NavItem {
  to: string;
  icon: Component;
  label: string;
}

interface Props {
  items: NavItem[];
  isActive: (to: string) => boolean;
  menuOpen: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  'update:menuOpen': [value: boolean];
}>();
</script>

<template>
  <ClientOnly>
    <nav
      class="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-border bg-background/95 backdrop-blur-xl lg:hidden bottom-nav-safe"
    >
      <div class="flex h-14 items-center justify-around px-2 max-w-md mx-auto">
        <NuxtLink
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          class="flex flex-col items-center justify-center gap-1 px-2 py-2 w-14 transition-all active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          :class="isActive(item.to) ? 'text-primary' : 'text-muted-foreground'"
        >
          <div class="relative">
            <component
              :is="item.icon"
              class="h-5 w-5 transition-transform"
              :class="isActive(item.to) ? 'scale-110' : ''"
              aria-hidden="true"
            />
            <div
              v-if="isActive(item.to)"
              class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary"
            />
          </div>
          <span class="font-pixel text-[7px] uppercase truncate w-full text-center leading-tight">{{
            item.label
          }}</span>
        </NuxtLink>

        <button
          type="button"
          class="flex flex-col items-center justify-center gap-1 px-2 py-2 w-14 transition-all active:translate-y-px cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          :class="menuOpen ? 'text-primary' : 'text-muted-foreground'"
          :aria-label="menuOpen ? 'Cerrar menú' : 'Abrir menú'"
          :aria-expanded="menuOpen"
          @click="emit('update:menuOpen', !menuOpen)"
        >
          <Menu
            class="h-5 w-5 transition-transform"
            :class="menuOpen ? 'scale-110' : ''"
            aria-hidden="true"
          />
          <span class="font-pixel text-[7px] uppercase">Menú</span>
        </button>
      </div>
    </nav>
  </ClientOnly>
</template>
