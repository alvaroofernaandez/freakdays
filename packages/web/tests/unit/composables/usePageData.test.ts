import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { usePageData } from '../../../app/composables/usePageData'

describe('usePageData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with null data, false loading, and null error', () => {
      const component = defineComponent({
        setup() {
          const { data, loading, error } = usePageData({
            fetcher: async () => 'test',
            immediate: false,
          })
          return { data, loading, error }
        },
        template: '<div></div>',
      })

      const wrapper = mount(component)
      expect(wrapper.vm.data).toBe(null)
      expect(wrapper.vm.loading).toBe(false)
      expect(wrapper.vm.error).toBe(null)
    })

    it('should load data immediately when immediate is true', async () => {
      const fetcher = vi.fn().mockResolvedValue('test-data')
      
      const component = defineComponent({
        setup() {
          const { data, loading } = usePageData({
            fetcher,
            immediate: true,
          })
          return { data, loading }
        },
        template: '<div></div>',
      })

      mount(component)
      await nextTick()
      
      expect(fetcher).toHaveBeenCalled()
    })

    it('should not load data when immediate is false', async () => {
      const fetcher = vi.fn().mockResolvedValue('test-data')
      
      const component = defineComponent({
        setup() {
          const { data } = usePageData({
            fetcher,
            immediate: false,
          })
          return { data }
        },
        template: '<div></div>',
      })

      mount(component)
      await nextTick()
      
      expect(fetcher).not.toHaveBeenCalled()
    })
  })

  describe('load', () => {
    it('should set loading to true while fetching', async () => {
      let resolveFetcher: (value: string) => void
      const fetcher = () => new Promise<string>((resolve) => {
        resolveFetcher = resolve
      })

      const component = defineComponent({
        setup() {
          const { loading, load } = usePageData({
            fetcher,
            immediate: false,
          })
          return { loading, load }
        },
        template: '<div></div>',
      })

      const wrapper = mount(component)
      const loadPromise = wrapper.vm.load()
      
      await nextTick()
      expect(wrapper.vm.loading).toBe(true)
      
      resolveFetcher!('test-data')
      await loadPromise
      await nextTick()
      
      expect(wrapper.vm.loading).toBe(false)
    })

    it('should set data when fetcher succeeds', async () => {
      const fetcher = vi.fn().mockResolvedValue('test-data')
      
      const component = defineComponent({
        setup() {
          const { data, load } = usePageData({
            fetcher,
            immediate: false,
          })
          return { data, load }
        },
        template: '<div></div>',
      })

      const wrapper = mount(component)
      await wrapper.vm.load()
      await nextTick()
      
      expect(wrapper.vm.data).toBe('test-data')
    })

    it('should set error when fetcher fails', async () => {
      const testError = new Error('Test error')
      const fetcher = vi.fn().mockRejectedValue(testError)
      
      const component = defineComponent({
        setup() {
          const { error, load } = usePageData({
            fetcher,
            immediate: false,
          })
          return { error, load }
        },
        template: '<div></div>',
      })

      const wrapper = mount(component)
      await wrapper.vm.load()
      await nextTick()
      
      expect(wrapper.vm.error).toBeInstanceOf(Error)
      expect(wrapper.vm.error?.message).toBe('Test error')
    })

    it('should call onError callback when fetcher fails', async () => {
      const testError = new Error('Test error')
      const fetcher = vi.fn().mockRejectedValue(testError)
      const onError = vi.fn()
      
      const component = defineComponent({
        setup() {
          const { load } = usePageData({
            fetcher,
            immediate: false,
            onError,
          })
          return { load }
        },
        template: '<div></div>',
      })

      const wrapper = mount(component)
      await wrapper.vm.load()
      await nextTick()
      
      expect(onError).toHaveBeenCalledWith(testError)
    })

    it('should not load if already loading', async () => {
      let resolveFetcher: (value: string) => void
      const fetcher = vi.fn(() => new Promise<string>((resolve) => {
        resolveFetcher = resolve
      }))

      const component = defineComponent({
        setup() {
          const { load } = usePageData({
            fetcher,
            immediate: false,
          })
          return { load }
        },
        template: '<div></div>',
      })

      const wrapper = mount(component)
      const load1 = wrapper.vm.load()
      const load2 = wrapper.vm.load()
      
      await nextTick()
      
      expect(fetcher).toHaveBeenCalledTimes(1)
      
      resolveFetcher!('test')
      await Promise.all([load1, load2])
    })
  })

  describe('reload', () => {
    it('should call load again', async () => {
      const fetcher = vi.fn().mockResolvedValue('test-data')
      
      const component = defineComponent({
        setup() {
          const { reload } = usePageData({
            fetcher,
            immediate: false,
          })
          return { reload }
        },
        template: '<div></div>',
      })

      const wrapper = mount(component)
      await wrapper.vm.reload()
      await wrapper.vm.reload()
      
      expect(fetcher).toHaveBeenCalledTimes(2)
    })
  })

  describe('readonly properties', () => {
    it('should return readonly data', () => {
      const component = defineComponent({
        setup() {
          const { data } = usePageData({
            fetcher: async () => 'test',
            immediate: false,
          })
          return { data }
        },
        template: '<div></div>',
      })

      const wrapper = mount(component)
      
      const originalValue = wrapper.vm.data
      try {
        // @ts-expect-error - testing readonly
        wrapper.vm.data = 'new-value'
      } catch {
        // readonly refs may not throw in runtime, only TypeScript prevents assignment
      }
      expect(wrapper.vm.data).toBe(originalValue)
    })

    it('should return readonly error', () => {
      const component = defineComponent({
        setup() {
          const { error } = usePageData({
            fetcher: async () => 'test',
            immediate: false,
          })
          return { error }
        },
        template: '<div></div>',
      })

      const wrapper = mount(component)
      
      const originalValue = wrapper.vm.error
      try {
        // @ts-expect-error - testing readonly
        wrapper.vm.error = new Error('test')
      } catch {
        // readonly refs may not throw in runtime, only TypeScript prevents assignment
      }
      expect(wrapper.vm.error).toBe(originalValue)
    })
  })
})

