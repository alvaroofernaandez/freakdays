<script setup lang="ts">
import type { Component } from 'vue'

interface NavItem {
  to: string
  icon: Component
  label: string
}

interface Props {
  items: NavItem[]
  isActive: (to: string) => boolean
}

defineProps<Props>()
</script>

<template>
  <ClientOnly>
    <div v-if="items.length > 0" class="flex items-center gap-0.5 md:gap-1 overflow-x-auto scrollbar-hide" style="position: relative; z-index: 10000;">
      <div class="w-px h-4 md:h-6 bg-border/50 mx-2 md:mx-3 shrink-0" />
      <NuxtLink v-for="item in items" :key="item.to" :to="item.to"
        class="relative flex items-center gap-1.5 md:gap-2 px-2 md:px-3 lg:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 group/nav whitespace-nowrap shrink-0"
        style="position: relative; z-index: 10001; pointer-events: auto !important;" :class="isActive(item.to)
          ? 'text-primary'
          : 'text-muted-foreground hover:text-foreground'">
        <div v-if="isActive(item.to)" class="absolute inset-0 bg-primary/10 rounded-lg -z-10 pointer-events-none" />
        <div
          class="absolute inset-0 bg-muted/50 rounded-lg opacity-0 group-hover/nav:opacity-100 transition-opacity duration-200 -z-10 pointer-events-none"
          :class="isActive(item.to) && 'opacity-0'" />
        <component :is="item.icon" class="h-3.5 w-3.5 md:h-4 md:w-4 transition-transform duration-200 group-hover/nav:scale-110 shrink-0"
          :class="isActive(item.to) ? 'text-primary' : ''" />
        <span class="relative hidden lg:inline">{{ item.label }}</span>
        <div v-if="isActive(item.to)"
          class="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full pointer-events-none" />
      </NuxtLink>
    </div>
  </ClientOnly>
</template>
