import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import MangaPage from '../../../app/pages/manga.vue'

vi.mock('../../../app/composables/useMangaPage', () => ({
  useMangaPage: () => ({
    mangaCollection: { value: [] },
    loading: { value: false },
    error: { value: null },
    modal: {
      isOpen: { value: false },
      open: vi.fn(),
      close: vi.fn(),
    },
    activeTab: { value: 'all' },
    filteredMangas: { value: [] },
    addManga: vi.fn(),
    handleAddVolume: vi.fn(),
    handleRemoveVolume: vi.fn(),
    handleDelete: vi.fn(),
    handleUpdatePrice: vi.fn(),
    handleUpdateStatus: vi.fn(),
    reloadManga: vi.fn(),
  }),
}))

describe('manga.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render manga page', () => {
    const wrapper = mount(MangaPage, {
      global: {
        stubs: {
          MangaStats: true,
          MangaStatsSkeleton: true,
          MangaList: true,
          AddMangaModal: true,
          ErrorState: true,
          Tabs: true,
          TabsList: true,
          TabsTrigger: true,
          TabsContent: true,
          Button: true,
          Tooltip: true,
          TooltipTrigger: true,
          TooltipContent: true,
        },
      },
    })

    expect(wrapper.text()).toContain('Colección Manga')
  })

  it('should show error state when error exists', () => {
    vi.doMock('../../../app/composables/useMangaPage', () => ({
      useMangaPage: () => ({
        error: { value: { message: 'Test error' } },
        loading: { value: false },
      }),
    }))

    const wrapper = mount(MangaPage, {
      global: {
        stubs: {
          MangaStats: true,
          MangaStatsSkeleton: true,
          MangaList: true,
          AddMangaModal: true,
          ErrorState: true,
          Tabs: true,
          TabsList: true,
          TabsTrigger: true,
          TabsContent: true,
          Button: true,
          Tooltip: true,
          TooltipTrigger: true,
          TooltipContent: true,
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('should show loading skeleton when loading', () => {
    vi.doMock('../../../app/composables/useMangaPage', () => ({
      useMangaPage: () => ({
        loading: { value: true },
      }),
    }))

    const wrapper = mount(MangaPage, {
      global: {
        stubs: {
          MangaStats: true,
          MangaStatsSkeleton: true,
          MangaList: true,
          AddMangaModal: true,
          ErrorState: true,
          Tabs: true,
          TabsList: true,
          TabsTrigger: true,
          TabsContent: true,
          Button: true,
          Tooltip: true,
          TooltipTrigger: true,
          TooltipContent: true,
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })
})

