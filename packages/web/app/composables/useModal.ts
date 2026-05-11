export function useModal(initialState = false) {
  const isOpen = ref(initialState)

  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function toggle() {
    isOpen.value = !isOpen.value
  }

  watch(isOpen, (open) => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  })

  onUnmounted(() => {
    document.body.style.overflow = ''
  })

  return {
    isOpen: readonly(isOpen),
    open,
    close,
    toggle,
  }
}

