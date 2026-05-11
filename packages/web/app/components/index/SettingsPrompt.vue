<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
</script>

<template>
  <Card class="border-dashed border-2 border-muted hover:border-primary/30 transition-colors group">
    <NuxtLink to="/profile">
      <CardHeader class="flex flex-row items-center justify-between">
        <div>
          <CardTitle class="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            ¿Quieres más módulos?
          </CardTitle>
          <CardDescription class="text-xs">
            Activa más funciones en tu perfil
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" class="group-hover:bg-primary/10">
          <span class="mr-2">Configurar</span>
          <ArrowRight class="h-4 w-4" />
        </Button>
      </CardHeader>
    </NuxtLink>
  </Card>
</template>

