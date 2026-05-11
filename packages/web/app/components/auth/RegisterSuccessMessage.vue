<script setup lang="ts">
import { Check, Gamepad2 } from 'lucide-vue-next'
</script>

<template>
  <div class="text-center space-y-6 py-4">
    <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-exp-easy/20 border-2 border-exp-easy/50">
      <Check class="h-10 w-10 text-exp-easy" />
    </div>
    <div class="space-y-2">
      <h3 class="text-xl font-bold text-exp-easy">¡Cuenta creada!</h3>
      <p class="text-muted-foreground text-sm">
        Revisa tu email para confirmar tu cuenta<br/>
        <span class="text-xs flex items-center justify-center gap-1">
          y desbloquear tu primera quest
          <Gamepad2 class="h-3 w-3" />
        </span>
      </p>
    </div>
    <Button as-child class="w-full h-12 bg-linear-to-r from-primary to-accent">
      <NuxtLink to="/login" class="font-semibold">
        Ir al Login
      </NuxtLink>
    </Button>
  </div>
</template>

