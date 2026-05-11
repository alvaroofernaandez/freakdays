import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useModal } from '../../../app/composables/useModal'

describe('useModal', () => {
  beforeEach(() => {
    document.body.style.overflow = ''
  })

  describe('initialization', () => {
    it('should initialize with default state (false)', () => {
      const { isOpen } = useModal()
      expect(isOpen.value).toBe(false)
    })

    it('should initialize with custom initial state', () => {
      const { isOpen } = useModal(true)
      expect(isOpen.value).toBe(true)
    })
  })

  describe('open', () => {
    it('should set isOpen to true', () => {
      const { isOpen, open } = useModal(false)
      open()
      expect(isOpen.value).toBe(true)
    })

    it('should block body scroll when opened', async () => {
      const component = defineComponent({
        setup() {
          const { open } = useModal(false)
          return { open }
        },
        template: '<div></div>',
      })
      const wrapper = mount(component)
      wrapper.vm.open()
      await wrapper.vm.$nextTick()
      expect(document.body.style.overflow).toBe('hidden')
      wrapper.unmount()
    })
  })

  describe('close', () => {
    it('should set isOpen to false', () => {
      const { isOpen, close } = useModal(true)
      close()
      expect(isOpen.value).toBe(false)
    })

    it('should restore body scroll when closed', () => {
      const { open, close } = useModal(false)
      open()
      close()
      expect(document.body.style.overflow).toBe('')
    })
  })

  describe('toggle', () => {
    it('should toggle from false to true', () => {
      const { isOpen, toggle } = useModal(false)
      toggle()
      expect(isOpen.value).toBe(true)
    })

    it('should toggle from true to false', () => {
      const { isOpen, toggle } = useModal(true)
      toggle()
      expect(isOpen.value).toBe(false)
    })
  })

  describe('readonly isOpen', () => {
    it('should return readonly ref', () => {
      const { isOpen, open } = useModal(false)
      const originalValue = isOpen.value
      try {
        // @ts-expect-error - testing readonly
        isOpen.value = true
      } catch {
        // readonly refs may not throw in runtime, only TypeScript prevents assignment
      }
      expect(isOpen.value).toBe(originalValue)
      
      open()
      expect(isOpen.value).toBe(true)
    })
  })

  describe('cleanup', () => {
    it('should restore body scroll on unmount', () => {
      const component = defineComponent({
        setup() {
          const { open } = useModal()
          open()
          return {}
        },
      })

      const wrapper = mount(component)
      expect(document.body.style.overflow).toBe('hidden')
      
      wrapper.unmount()
      expect(document.body.style.overflow).toBe('')
    })
  })
})

