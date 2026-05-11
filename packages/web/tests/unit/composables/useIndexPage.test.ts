import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useIndexPage } from '../../../app/composables/useIndexPage'

vi.mock('../../../app/composables/useProfile', () => ({
  useProfile: () => ({
    fetchProfile: vi.fn().mockResolvedValue(null),
    expForNextLevel: vi.fn(() => ({ current: 0, needed: 100, progress: 0 })),
  }),
}))

vi.mock('../../../app/composables/useQuests', () => ({
  useQuests: () => ({
    fetchQuests: vi.fn().mockResolvedValue([]),
    fetchTodayCompletions: vi.fn().mockResolvedValue([]),
  }),
}))

vi.mock('../../../app/composables/useAnime', () => ({
  useAnime: () => ({
    fetchAnimeList: vi.fn().mockResolvedValue([]),
  }),
}))

vi.mock('../../../app/composables/useWorkouts', () => ({
  useWorkouts: () => ({
    fetchWorkouts: vi.fn().mockResolvedValue([]),
  }),
}))

vi.mock('../../../app/composables/useSupabase', () => ({
  useSupabase: () => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      })),
    })),
  }),
}))

vi.mock('../../../app/utils/greeting', () => ({
  getGreeting: () => 'Buenos días',
}))

describe('useIndexPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should initialize with default values', () => {
    const component = defineComponent({
      setup() {
        const { profile, isLoading, greeting, expProgress, quickStats } = useIndexPage()
        return { profile, isLoading, greeting, expProgress, quickStats }
      },
      template: '<div></div>',
    })

    const wrapper = mount(component)
    
    expect(wrapper.vm.profile).toBe(null)
    expect(wrapper.vm.isLoading).toBe(true)
    expect(wrapper.vm.greeting).toBe('Buenos días')
    expect(wrapper.vm.expProgress.current).toBe(0)
    expect(wrapper.vm.quickStats.questsToday).toBe(0)
  })

  it('should compute exp progress correctly', () => {
    const component = defineComponent({
      setup() {
        const { expProgress } = useIndexPage()
        return { expProgress }
      },
      template: '<div></div>',
    })

    const wrapper = mount(component)
    
    expect(wrapper.vm.expProgress).toHaveProperty('current')
    expect(wrapper.vm.expProgress).toHaveProperty('needed')
    expect(wrapper.vm.expProgress).toHaveProperty('progress')
  })
})

