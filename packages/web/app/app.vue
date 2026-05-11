<script setup lang="ts">
const auth = useAuth()

onMounted(() => {
  auth.initialize()
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ToastContainer />
</template>
