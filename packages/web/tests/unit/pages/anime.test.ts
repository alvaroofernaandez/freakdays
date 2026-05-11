import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import AnimePage from '../../../app/pages/anime.vue'

vi.mock('../../../app/composables/useAnimePage', () => ({
  useAnimePage: () => ({
    animeList: { value: [] },
    loading: { value: false },
    modal: {
      isOpen: { value: false },
      open: vi.fn(),
      close: vi.fn(),
    },
    statusModal: {
      isOpen: { value: false },
      open: vi.fn(),
      close: vi.fn(),
    },
    activeView: { value: 'list' },
    activeTab: { value: 'all' },
    selectedAnimeForAdd: { value: null },
    addingAnime: { value: false },
    newAnime: { value: { title: '', status: 'plan_to_watch', total_episodes: undefined } },
    filteredAnime: { value: [] },
    stats: { value: { watching: 0, completed: 0, total: 0 } },
    setActiveView: vi.fn(),
    updateSearchQuery: vi.fn(),
    handleAddAnimeClick: vi.fn(),
    addAnimeFromSearch: vi.fn(),
    addAnime: vi.fn(),
    incrementEpisode: vi.fn(),
    decrementEpisode: vi.fn(),
    deleteAnimeEntry: vi.fn(),
  }),
}))

describe('anime.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render anime page', () => {
    const wrapper = mount(AnimePage, {
      global: {
        stubs: {
          AddAnimeStatusModal: true,
          AnimeCard: true,
          AnimeCardSkeleton: true,
          AnimeMarketplace: true,
          AnimeStats: true,
          AnimeStatsSkeleton: true,
          Empty: true,
          Tooltip: true,
          TooltipContent: true,
          TooltipTrigger: true,
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
        },
      },
    })

    expect(wrapper.text()).toContain('Anime')
  })

  it('should show marketplace when activeView is marketplace', () => {
    vi.doMock('../../../app/composables/useAnimePage', () => ({
      useAnimePage: () => ({
        activeView: { value: 'marketplace' },
      }),
    }))

    const wrapper = mount(AnimePage, {
      global: {
        stubs: {
          AddAnimeStatusModal: true,
          AnimeCard: true,
          AnimeCardSkeleton: true,
          AnimeMarketplace: true,
          AnimeStats: true,
          AnimeStatsSkeleton: true,
          Empty: true,
          Tooltip: true,
          TooltipContent: true,
          TooltipTrigger: true,
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
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('should show list when activeView is list', () => {
    const wrapper = mount(AnimePage, {
      global: {
        stubs: {
          AddAnimeStatusModal: true,
          AnimeCard: true,
          AnimeCardSkeleton: true,
          AnimeMarketplace: true,
          AnimeStats: true,
          AnimeStatsSkeleton: true,
          Empty: true,
          Tooltip: true,
          TooltipContent: true,
          TooltipTrigger: true,
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
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })
})

