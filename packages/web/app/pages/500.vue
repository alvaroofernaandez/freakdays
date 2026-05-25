<script setup lang="ts">
import { AlertTriangle, Home, RefreshCw, ArrowLeft } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';

definePageMeta({
  layout: false,
});

const router = useRouter();

function goHome() {
  router.push('/');
}

function goBack() {
  router.back();
}

function retry() {
  window.location.reload();
}

const NOTCH_LG =
  'polygon(0 10px,10px 10px,10px 0,calc(100% - 10px) 0,calc(100% - 10px) 10px,100% 10px,100% calc(100% - 10px),calc(100% - 10px) calc(100% - 10px),calc(100% - 10px) 100%,10px 100%,10px calc(100% - 10px),0 calc(100% - 10px))';
</script>

<template>
  <div
    class="relative min-h-screen animated-gradient-bg flex items-center justify-center p-6 overflow-hidden"
  >
    <!-- Ambient background: orbs + HUD grid -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div class="absolute top-20 left-10 w-72 h-72 bg-destructive/8 rounded-full blur-3xl" />
      <div class="absolute bottom-24 right-10 w-80 h-80 bg-destructive/5 rounded-full blur-3xl" />
      <div
        class="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] bg-primary/5 rounded-full blur-3xl"
      />
      <div
        class="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,var(--color-destructive)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-destructive)_1px,transparent_1px)] bg-[size:44px_44px]"
      />
    </div>

    <div
      class="relative z-10 w-full max-w-md space-y-8 text-center motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500"
    >
      <!-- Notched icon emblem -->
      <div class="flex justify-center">
        <div
          class="pixelated inline-flex items-center justify-center w-24 h-24 bg-linear-to-br from-destructive via-primary to-accent p-[3px] shadow-[0_0_50px_-8px_var(--color-destructive)]"
          :style="{ clipPath: NOTCH_LG }"
        >
          <div
            class="w-full h-full bg-card flex items-center justify-center"
            style="
              clip-path: polygon(
                0 8px,
                8px 8px,
                8px 0,
                calc(100% - 8px) 0,
                calc(100% - 8px) 8px,
                100% 8px,
                100% calc(100% - 8px),
                calc(100% - 8px) calc(100% - 8px),
                calc(100% - 8px) 100%,
                8px 100%,
                8px calc(100% - 8px),
                0 calc(100% - 8px)
              );
            "
          >
            <AlertTriangle class="h-10 w-10 text-destructive" aria-hidden="true" />
          </div>
        </div>
      </div>

      <!-- Error code + title -->
      <div class="space-y-2">
        <p
          class="font-pixel text-7xl sm:text-8xl leading-none text-destructive drop-shadow-[0_0_24px_var(--color-destructive)] tabular-nums"
          aria-label="Error 500"
        >
          500
        </p>
        <p class="font-pixel text-[9px] text-muted-foreground/70 uppercase tracking-widest">
          ERROR DEL SERVIDOR
        </p>
        <h1 class="text-xl font-bold text-foreground">Algo salió mal</h1>
      </div>

      <!-- Info panel -->
      <div class="relative rounded-none border-2 border-destructive/20 bg-card/40 p-5 text-left">
        <!-- HUD brackets -->
        <span
          class="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-destructive/40"
          aria-hidden="true"
        />
        <span
          class="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-destructive/40"
          aria-hidden="true"
        />
        <span
          class="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-destructive/40"
          aria-hidden="true"
        />
        <span
          class="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-destructive/40"
          aria-hidden="true"
        />

        <p class="font-pixel text-[9px] text-destructive/80 mb-3 uppercase">
          <span class="text-destructive">▸</span> ¿QUÉ HA PASADO?
        </p>
        <p class="text-sm text-muted-foreground">
          Se detectó un error en el servidor. Esto puede ser temporal. Intenta recargar la página en
          unos momentos.
        </p>
      </div>

      <!-- CTAs -->
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          variant="outline"
          class="btn-game flex-1 sm:flex-none rounded-none border-2 font-pixel text-[10px] cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
          @click="goBack"
        >
          <ArrowLeft class="h-4 w-4 mr-2" aria-hidden="true" />
          VOLVER
        </Button>
        <Button
          variant="outline"
          class="btn-game flex-1 sm:flex-none rounded-none border-2 font-pixel text-[10px] hover:border-primary/40 hover:text-primary cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
          @click="retry"
        >
          <RefreshCw class="h-4 w-4 mr-2" aria-hidden="true" />
          REINTENTAR
        </Button>
        <Button
          class="btn-game flex-1 sm:flex-none rounded-none font-pixel text-[10px] bg-linear-to-r from-primary to-accent cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
          @click="goHome"
        >
          <Home class="h-4 w-4 mr-2" aria-hidden="true" />
          VOLVER AL INICIO
        </Button>
      </div>
    </div>
  </div>
</template>
