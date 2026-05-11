<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Shield, UserPlus, Users } from 'lucide-vue-next'
</script>

<template>
  <div class="relative">
    <div class="absolute inset-0 -z-10 overflow-hidden">
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"
        style="animation-duration: 4s"
      />
      <div
        class="absolute top-1/3 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-pulse"
        style="animation-duration: 6s; animation-delay: 1s"
      />
    </div>

    <Card
      class="border-dashed border-2 border-primary/30 bg-linear-to-br from-background to-muted/20 relative overflow-hidden"
    >
      <div
        class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"
      />
      <div class="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

      <CardContent class="relative py-8 sm:py-12 md:py-16 px-4 sm:px-6">
        <div class="flex flex-col items-center text-center space-y-4 sm:space-y-6 max-w-md mx-auto">
          <div class="relative">
            <div class="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div class="relative bg-linear-to-br from-primary/20 to-accent/20 p-4 sm:p-6 rounded-full">
              <Users class="h-12 w-12 sm:h-16 sm:w-16 text-primary" />
            </div>
          </div>

          <div class="space-y-2">
            <h3
              class="text-xl sm:text-2xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent"
            >
              ¡Comienza tu aventura en grupo!
            </h3>
            <p class="text-muted-foreground text-sm sm:text-base leading-relaxed px-2">
              Crea tu primera party para compartir tus progresos con amigos o únete a una existente usando un código
              de invitación
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto" role="group" aria-label="Acciones para empezar">
            <Button
              size="lg"
              class="flex-1 sm:flex-none glow-primary group relative overflow-hidden min-h-[44px]"
              @click="$emit('create')"
              aria-label="Crear tu primera party"
            >
              <span class="relative z-10 flex items-center justify-center">
                <Plus class="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" aria-hidden="true" />
                <span>Crear Party</span>
              </span>
              <div
                class="absolute inset-0 bg-linear-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            </Button>
            <Button
              variant="outline"
              size="lg"
              class="flex-1 sm:flex-none border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 min-h-[44px]"
              @click="$emit('join')"
              aria-label="Unirse a una party existente con código de invitación"
            >
              <UserPlus class="h-5 w-5 mr-2" aria-hidden="true" />
              <span>Unirse con Código</span>
            </Button>
          </div>

          <div class="pt-3 sm:pt-4 border-t border-border/50 w-full px-2">
            <p class="text-xs text-muted-foreground flex items-center justify-center gap-2 flex-wrap">
              <Shield class="h-3 w-3 shrink-0" />
              <span class="text-center">Las parties son privadas y solo los miembros pueden ver el contenido</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

