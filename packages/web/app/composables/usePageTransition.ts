export function usePageTransition() {
  const route = useRoute()
  const isTransitioning = ref(false)

  watch(() => route.path, () => {
    isTransitioning.value = true
    nextTick(() => {
      setTimeout(() => {
        isTransitioning.value = false
      }, 150)
    })
  })

  return {
    isTransitioning: readonly(isTransitioning),
  }
}

