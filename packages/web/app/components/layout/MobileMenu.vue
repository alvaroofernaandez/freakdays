<script setup lang="ts">
import { User, Settings, LogOut, X, Trophy } from 'lucide-vue-next'
import type { Component } from 'vue'

interface NavItem {
  to: string
  icon: Component
  label: string
}

interface Props {
  open: boolean
  items: NavItem[]
  isActive: (to: string) => boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  logout: []
}>()
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="open"
      class="fixed inset-0 z-40 bg-background/95 backdrop-blur-sm lg:hidden flex flex-col pt-16 animate-in slide-in-from-bottom-10 fade-in duration-200"
      @click.self="emit('close')"
    >
    <div class="flex-1 overflow-y-auto p-4 space-y-6">
      <div class="grid grid-cols-2 gap-3">
        <ClientOnly>
          <div class="contents">
            <NuxtLink 
              v-for="item in items" 
              :key="item.to"
              :to="item.to"
              class="flex flex-col items-center justify-center p-4 rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-colors gap-2"
              :class="isActive(item.to) ? 'border-primary bg-primary/5' : ''"
              @click="emit('close')"
            >
              <component :is="item.icon" class="h-6 w-6" :class="isActive(item.to) ? 'text-primary' : 'text-muted-foreground'" />
              <span class="font-medium text-sm">{{ item.label }}</span>
            </NuxtLink>
          </div>
        </ClientOnly>
      </div>

      <div class="space-y-4">
        <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider px-2">
          Cuenta
        </h3>
        <div class="bg-card rounded-xl border border-border/50 overflow-hidden">
          <NuxtLink to="/profile" class="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors border-b border-border/50" @click="emit('close')">
            <User class="h-5 w-5 text-muted-foreground" />
            <div class="flex-1">
              <div class="font-medium">Mi Perfil</div>
              <div class="text-xs text-muted-foreground">Ver progreso y estadísticas</div>
            </div>
            <Trophy class="h-4 w-4 text-exp-legendary" />
          </NuxtLink>
          <button @click="emit('logout')" class="w-full flex items-center gap-3 p-4 hover:bg-destructive/10 transition-colors text-destructive text-left">
            <LogOut class="h-5 w-5" />
            <span class="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
    
    <div class="p-4 border-t border-border">
      <Button variant="outline" class="w-full" @click="emit('close')">
        <X class="h-4 w-4 mr-2" />
        Cerrar Menú
      </Button>
    </div>
    </div>
  </Teleport>
</template>

