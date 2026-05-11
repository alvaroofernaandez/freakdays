<script setup lang="ts">
import { ArrowRight, BarChart3, Gamepad2, Sparkles, Zap } from 'lucide-vue-next';
</script>

<template>
  <section class="relative flex flex-col items-center text-center space-y-8 py-12 sm:py-16 overflow-hidden">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse will-change-transform" />
      <div
        class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse will-change-transform"
        style="animation-delay: 1s" />
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/5 rounded-full blur-3xl will-change-transform" />
    </div>

    <div class="relative z-10">
      <div class="relative inline-flex items-center justify-center">
        <div class="absolute -inset-8 bg-primary/20 blur-3xl rounded-full animate-pulse will-change-transform" />
        <div class="absolute -inset-4 bg-accent/10 blur-2xl rounded-full will-change-transform" />
        <div
          class="relative p-4 rounded-2xl bg-linear-to-br from-primary/20 via-accent/10 to-secondary/10 backdrop-blur-sm border border-primary/20">
          <img src="/logo.png" alt="FreakDays"
            class="relative h-20 w-20 sm:h-24 sm:w-24 rounded-lg drop-shadow-lg animate-[float_3s_ease-in-out_infinite] will-change-transform"
            loading="eager" fetchpriority="high" style="image-rendering: -webkit-optimize-contrast;" />
        </div>
        <div class="absolute -top-2 -right-2">
          <Sparkles class="h-5 w-5 text-accent animate-pulse will-change-transform" />
        </div>
      </div>
    </div>

    <div class="relative z-10 space-y-4 max-w-2xl">
      <div class="space-y-3">
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold text-gradient leading-tight">
          Bienvenido a <span class="font-logo">FreakDays</span>
        </h1>
        <p class="text-muted-foreground text-base sm:text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
          Tu compañero definitivo para gestionar tu vida friki.
          <span class="text-primary/80">Entrenamientos, animes, mangas, quests y más.</span>
        </p>
      </div>

      <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <Gamepad2 class="h-3.5 w-3.5 text-primary" />
          <span class="text-xs sm:text-sm text-primary font-medium">Gamificación</span>
        </div>
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
          <BarChart3 class="h-3.5 w-3.5 text-accent" />
          <span class="text-xs sm:text-sm text-accent font-medium">Tracking</span>
        </div>
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20">
          <Zap class="h-3.5 w-3.5 text-secondary" />
          <span class="text-xs sm:text-sm text-secondary font-medium">Productividad</span>
        </div>
      </div>
    </div>

    <div class="relative z-10 pt-4">
      <Button size="lg"
        class="group relative h-14 px-8 text-base font-semibold glow-primary hover:glow-primary hover:scale-105 transition-all duration-300 overflow-hidden"
        as-child>
        <NuxtLink to="/onboarding" class="flex items-center gap-3">
          <span class="relative z-10">Comenzar Aventura</span>
          <ArrowRight class="h-5 w-5 relative z-10 transition-transform group-hover:translate-x-1" />
          <div
            class="absolute inset-0 bg-linear-to-r from-primary via-accent to-secondary opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        </NuxtLink>
      </Button>
    </div>
  </section>
</template>

<style scoped>
@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

section {
  min-height: 600px;
  contain: layout style paint;
  will-change: contents;
}

section>* {
  will-change: transform, opacity;
}
</style>
