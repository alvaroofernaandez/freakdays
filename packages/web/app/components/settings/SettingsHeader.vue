<script setup lang="ts">
import { ChevronLeft, Settings as SettingsIcon, Check } from 'lucide-vue-next'

interface Props {
  saving: boolean
  saved: boolean
}

defineProps<Props>()
</script>

<template>
  <header class="flex items-center gap-3">
    <NuxtLink to="/" class="lg:hidden">
      <Button variant="ghost" size="icon" class="h-9 w-9">
        <ChevronLeft class="h-5 w-5" />
      </Button>
    </NuxtLink>
    <div class="flex-1">
      <h1 class="text-xl sm:text-2xl font-bold flex items-center gap-2">
        <SettingsIcon class="h-6 w-6 text-primary" />
        Configuración
      </h1>
      <p class="text-muted-foreground text-sm">
        Gestiona tus módulos activos
      </p>
    </div>
    <div v-if="saving || saved" class="flex items-center gap-2 text-sm">
      <div v-if="saving" class="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
      <div v-else-if="saved" class="flex items-center gap-1 text-exp-easy">
        <Check class="h-4 w-4" />
        <span>Guardado</span>
      </div>
    </div>
  </header>
</template>

