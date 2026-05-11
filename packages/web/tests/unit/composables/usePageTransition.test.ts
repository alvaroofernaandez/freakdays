import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { usePageTransition } from '../../../app/composables/usePageTransition'

const mockRoute = {
  path: '/test',
}

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
}))

describe('usePageTransition', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('should initialize with isTransitioning as false', () => {
    const component = defineComponent({
      setup() {
        const { isTransitioning } = usePageTransition()
        return { isTransitioning }
      },
      template: '<div>{{ isTransitioning }}</div>',
    })

    const wrapper = mount(component)
    expect(wrapper.vm.isTransitioning).toBe(false)
  })

  it('should return readonly isTransitioning', () => {
    const component = defineComponent({
      setup() {
        const { isTransitioning } = usePageTransition()
        return { isTransitioning }
      },
      template: '<div></div>',
    })

    const wrapper = mount(component)
    
    const originalValue = wrapper.vm.isTransitioning
    try {
      // @ts-expect-error - testing readonly
      wrapper.vm.isTransitioning = true
    } catch {
      // readonly refs may not throw in runtime, only TypeScript prevents assignment
    }
    expect(wrapper.vm.isTransitioning).toBe(originalValue)
  })
})

