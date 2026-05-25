<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Shield, UserPlus, Users } from 'lucide-vue-next';

defineEmits<{
  create: [];
  join: [];
}>();

const NOTCH =
  'polygon(0 8px,8px 8px,8px 0,calc(100% - 8px) 0,calc(100% - 8px) 8px,100% 8px,100% calc(100% - 8px),calc(100% - 8px) calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,8px calc(100% - 8px),0 calc(100% - 8px))';
</script>

<template>
  <div class="relative" role="status" aria-live="polite">
    <!-- Ambient orbs -->
    <div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/5 rounded-full blur-3xl motion-safe:animate-pulse"
        style="animation-duration: 4s"
      />
      <div
        class="absolute top-1/3 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl motion-safe:animate-pulse"
        style="animation-duration: 6s; animation-delay: 1s"
      />
    </div>

    <Card class="rounded-none border-2 border-dashed border-secondary/30 bg-card/40">
      <CardContent class="relative py-8 sm:py-12 md:py-16 px-4 sm:px-6">
        <div class="flex flex-col items-center text-center space-y-5 sm:space-y-6 max-w-md mx-auto">
          <!-- Notched icon emblem -->
          <div
            class="w-20 h-20 sm:w-24 sm:h-24 bg-secondary/20 flex items-center justify-center"
            :style="{ clipPath: NOTCH }"
            aria-hidden="true"
          >
            <Users class="h-10 w-10 sm:h-12 sm:w-12 text-secondary" />
          </div>

          <div class="space-y-2">
            <p class="font-pixel text-[9px] text-secondary/80 uppercase tracking-wider">
              SIN DATOS
            </p>
            <h3 class="text-xl sm:text-2xl font-bold text-foreground">
              Comienza tu aventura en grupo
            </h3>
            <p class="text-muted-foreground text-sm sm:text-base leading-relaxed px-2">
              Crea tu primera party para compartir tus progresos con amigos o únete a una existente
              usando un código de invitación.
            </p>
          </div>

          <div
            class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
            role="group"
            aria-label="Acciones para empezar"
          >
            <Button
              size="lg"
              class="btn-game flex-1 sm:flex-none rounded-none font-pixel text-[10px] group relative overflow-hidden min-h-[44px] cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Crear tu primera party"
              @click="$emit('create')"
            >
              <Plus
                class="h-5 w-5 mr-2 motion-safe:group-hover:rotate-90 transition-transform duration-300"
                aria-hidden="true"
              />
              CREAR PARTY
            </Button>
            <Button
              variant="outline"
              size="lg"
              class="btn-game flex-1 sm:flex-none rounded-none border-2 font-pixel text-[10px] hover:border-secondary/50 hover:bg-secondary/5 transition-all duration-200 min-h-[44px] cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Unirse a una party existente con código de invitación"
              @click="$emit('join')"
            >
              <UserPlus class="h-5 w-5 mr-2" aria-hidden="true" />
              UNIRSE CON CÓDIGO
            </Button>
          </div>

          <div class="pt-3 sm:pt-4 border-t border-border/40 w-full px-2">
            <p
              class="font-pixel text-[8px] text-muted-foreground/70 flex items-center justify-center gap-2 flex-wrap uppercase"
            >
              <Shield class="h-3 w-3 shrink-0" aria-hidden="true" />
              <span class="text-center">
                Las parties son privadas — solo los miembros pueden ver el contenido
              </span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
