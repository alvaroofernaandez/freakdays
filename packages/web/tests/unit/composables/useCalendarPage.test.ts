import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useCalendarPage } from '../../../app/composables/useCalendarPage'

vi.mock('../../../app/composables/useCalendar', () => ({
  useCalendar: () => ({
    fetchReleases: vi.fn().mockResolvedValue([]),
    addRelease: vi.fn().mockResolvedValue(null),
    updateRelease: vi.fn().mockResolvedValue(null),
    deleteRelease: vi.fn().mockResolvedValue(true),
  }),
}))

vi.mock('../../../app/composables/useModal', () => ({
  useModal: () => ({
    isOpen: { value: false },
    open: vi.fn(),
    close: vi.fn(),
  }),
}))

vi.mock('../../../app/composables/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}))

vi.mock('../../../app/composables/usePageData', () => ({
  usePageData: () => ({
    data: { value: [] },
    loading: { value: false },
    reload: vi.fn().mockResolvedValue(undefined),
  }),
}))

describe('useCalendarPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should initialize with default values', () => {
    const component = defineComponent({
      setup() {
        const { releases, loading, currentMonth, newRelease } = useCalendarPage()
        return { releases, loading, currentMonth, newRelease }
      },
      template: '<div></div>',
    })

    const wrapper = mount(component)
    
    expect(wrapper.vm.releases).toEqual([])
    expect(wrapper.vm.loading.value).toBe(false)
    expect(wrapper.vm.currentMonth).toBeInstanceOf(Date)
    expect(wrapper.vm.newRelease.title).toBe('')
  })

  it('should format date correctly', () => {
    const component = defineComponent({
      setup() {
        const { formatDate } = useCalendarPage()
        return { formatDate }
      },
      template: '<div></div>',
    })

    const wrapper = mount(component)
    const date = new Date('2024-01-15')
    const formatted = wrapper.vm.formatDate(date)
    
    expect(formatted).toContain('15')
    expect(formatted).toContain('ene')
  })

  it('should compute month name correctly', () => {
    const component = defineComponent({
      setup() {
        const { monthName, currentMonth } = useCalendarPage()
        return { monthName, currentMonth }
      },
      template: '<div></div>',
    })

    const wrapper = mount(component)
    wrapper.vm.currentMonth = new Date('2024-01-15')
    
    expect(wrapper.vm.monthName).toContain('enero')
    expect(wrapper.vm.monthName).toContain('2024')
  })
})

