<script setup lang="ts">
interface Props {
  enabledModulesCount: number
}

defineProps<Props>()
</script>

<template>
  <section class="space-y-3">
    <h2 class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
      Información
    </h2>
    
    <Card>
      <CardContent class="py-4 space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-muted-foreground">Versión</span>
          <span class="font-mono">1.0.0</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-muted-foreground">Módulos activos</span>
          <Badge variant="secondary">{{ enabledModulesCount }}</Badge>
        </div>
      </CardContent>
    </Card>
  </section>
</template>

