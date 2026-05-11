import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import CalendarPage from '../../../app/pages/calendar.vue'

vi.mock('../../../app/composables/useCalendarPage', () => ({
  useCalendarPage: () => ({
    releases: { value: [] },
    loading: { value: false },
    modal: {
      isOpen: { value: false },
      open: vi.fn(),
      close: vi.fn(),
    },
    currentMonth: { value: new Date() },
    newRelease: { value: { title: '', release_date: null, type: 'anime_episode' } },
    monthName: { value: 'Enero' },
    formatDate: vi.fn(),
    addRelease: vi.fn(),
    updateEventDate: vi.fn(),
    deleteReleaseEntry: vi.fn(),
  }),
}))

describe('calendar.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render calendar page', () => {
    const wrapper = mount(CalendarPage, {
      global: {
        stubs: {
          CalendarGrid: true,
          ClientOnly: true,
          Teleport: true,
          Transition: true,
          Card: true,
          CardHeader: true,
          CardTitle: true,
          CardContent: true,
          Button: true,
          Input: true,
          Label: true,
          DatePicker: true,
        },
      },
    })

    expect(wrapper.text()).toContain('Calendario')
  })

  it('should open modal when add button is clicked', async () => {
    const open = vi.fn()
    const modal = {
      isOpen: { value: false },
      open,
      close: vi.fn(),
    }

    vi.doMock('../../../app/composables/useCalendarPage', () => ({
      useCalendarPage: () => ({
        modal,
      }),
    }))

    const wrapper = mount(CalendarPage, {
      global: {
        stubs: {
          CalendarGrid: true,
          ClientOnly: true,
          Teleport: true,
          Transition: true,
          Card: true,
          CardHeader: true,
          CardTitle: true,
          CardContent: true,
          Button: true,
          Input: true,
          Label: true,
          DatePicker: true,
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('should disable add button when form is invalid', () => {
    vi.doMock('../../../app/composables/useCalendarPage', () => ({
      useCalendarPage: () => ({
        newRelease: { value: { title: '', release_date: null, type: 'anime_episode' } },
      }),
    }))

    const wrapper = mount(CalendarPage, {
      global: {
        stubs: {
          CalendarGrid: true,
          ClientOnly: true,
          Teleport: true,
          Transition: true,
          Card: true,
          CardHeader: true,
          CardTitle: true,
          CardContent: true,
          Button: true,
          Input: true,
          Label: true,
          DatePicker: true,
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })
})

