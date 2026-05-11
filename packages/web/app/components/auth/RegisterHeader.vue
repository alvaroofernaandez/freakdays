<script setup lang="ts">
import { Gamepad2, Sparkles, Zap } from 'lucide-vue-next';
</script>

<template>
  <header class="text-center space-y-4">
    <div
      class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-br from-primary via-accent to-secondary p-[2px] mb-2">
      <div class="w-full h-full rounded-2xl bg-card flex items-center justify-center">
        <Gamepad2 class="h-10 w-10 text-primary" />
      </div>
    </div>

    <div>
      <h1 class="text-3xl font-logo text-gradient">FreakDays</h1>
      <div class="flex items-center justify-center gap-2 mt-2">
        <Sparkles class="h-4 w-4 text-accent" />
        <p class="text-muted-foreground text-sm">Tu vida, gamificada</p>
        <Zap class="h-4 w-4 text-secondary" />
      </div>
    </div>

    <h2 class="text-xl font-semibold text-foreground pt-2">Únete a la aventura</h2>
  </header>
</template>
