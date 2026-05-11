<script setup lang="ts">
import { Menu } from 'lucide-vue-next'
import type { Component } from 'vue'

interface NavItem {
  to: string
  icon: Component
  label: string
}

interface Props {
  items: NavItem[]
  isActive: (to: string) => boolean
  menuOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:menuOpen': [value: boolean]
}>()
</script>

<template>
  <ClientOnly>
    <nav class="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl lg:hidden">
      <div class="flex h-16 items-center justify-around px-2 max-w-md mx-auto">
        <NuxtLink v-for="item in items" :key="item.to" :to="item.to"
          class="flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 transition-all active:scale-95 w-16"
          :class="isActive(item.to)
            ? 'text-primary'
            : 'text-muted-foreground'">
          <div class="relative">
            <component :is="item.icon" class="h-5 w-5 transition-transform"
              :class="isActive(item.to) ? 'scale-110' : ''" />
            <div v-if="isActive(item.to)"
              class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
          </div>
          <span class="text-[10px] font-medium truncate w-full text-center">{{ item.label }}</span>
        </NuxtLink>

        <button
          class="flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 transition-all active:scale-95 w-16 text-muted-foreground"
          :class="menuOpen ? 'text-primary' : ''" @click="emit('update:menuOpen', !menuOpen)">
          <div class="relative">
            <Menu class="h-5 w-5 transition-transform" :class="menuOpen ? 'scale-110' : ''" />
          </div>
          <span class="text-[10px] font-medium">Menú</span>
        </button>
      </div>
    </nav>
  </ClientOnly>
</template>
