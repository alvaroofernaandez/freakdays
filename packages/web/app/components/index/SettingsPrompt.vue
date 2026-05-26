<script setup lang="ts">
import { Settings } from 'lucide-vue-next';
</script>

<template>
  <NuxtLink
    to="/profile"
    class="block border-2 border-dashed border-muted hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
  >
    <div class="flex items-center justify-between px-4 py-3">
      <div>
        <p
          class="font-pixel text-[9px] text-muted-foreground group-hover:text-foreground transition-colors uppercase"
        >
          ▸ ¿Quieres más módulos?
        </p>
        <p class="text-xs text-muted-foreground/70 mt-0.5">Activa más funciones en tu perfil</p>
      </div>
      <div
        class="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors"
      >
        <Settings class="h-4 w-4" aria-hidden="true" />
        <span class="font-pixel text-[8px] uppercase">Configurar</span>
      </div>
    </div>
  </NuxtLink>
</template>
