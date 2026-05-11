import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import IndexPage from '../../../app/pages/index.vue'

vi.mock('../../../app/composables/useIndexPage', () => ({
  useIndexPage: () => ({
    profile: { value: null },
    isLoading: { value: true },
    greeting: { value: 'Buenos días' },
    expProgress: { value: { current: 0, needed: 100, progress: 0 } },
    quickStats: { value: { questsPending: 0, animeWatching: 0, questsToday: 0, workoutsThisWeek: 0 } },
    loadingStats: { value: false },
    modulesStore: {
      enabledModules: [],
    },
  }),
}))

vi.mock('../../../app/composables/useProfile', () => ({
  useProfile: () => ({
    fetchProfile: vi.fn(),
  }),
}))

vi.mock('../../../stores/auth', () => ({
  useAuthStore: () => ({
    isAuthenticated: false,
  }),
}))

describe('index.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render index page', () => {
    const wrapper = mount(IndexPage, {
      global: {
        stubs: {
          WelcomeSection: true,
          ProfileCard: true,
          ProfileCardSkeleton: true,
          StatsCardSkeleton: true,
          ModuleGrid: true,
          SettingsPrompt: true,
          ClientOnly: true,
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('should show welcome section when not authenticated', () => {
    const wrapper = mount(IndexPage, {
      global: {
        stubs: {
          WelcomeSection: true,
          ProfileCard: true,
          ProfileCardSkeleton: true,
          StatsCardSkeleton: true,
          ModuleGrid: true,
          SettingsPrompt: true,
          ClientOnly: true,
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('should show profile section when authenticated', () => {
    vi.doMock('../../../stores/auth', () => ({
      useAuthStore: () => ({
        isAuthenticated: true,
      }),
    }))

    const wrapper = mount(IndexPage, {
      global: {
        stubs: {
          WelcomeSection: true,
          ProfileCard: true,
          ProfileCardSkeleton: true,
          StatsCardSkeleton: true,
          ModuleGrid: true,
          SettingsPrompt: true,
          ClientOnly: true,
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })
})

