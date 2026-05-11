<script setup lang="ts">
</script>

<template>
  <ClientOnly>
    <div class="flex justify-center py-12">
      <div class="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
    <template #fallback>
      <div class="flex justify-center py-12">
        <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    </template>
  </ClientOnly>
</template>
