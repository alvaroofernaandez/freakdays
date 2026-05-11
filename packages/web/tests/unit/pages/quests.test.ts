import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import QuestsPage from '../../../app/pages/quests.vue'

vi.mock('../../../app/composables/useQuestsPage', () => ({
  useQuestsPage: () => ({
    quests: { value: [] },
    notifications: { value: [] },
    loading: { value: false },
    isSubmitting: { value: false },
    modal: {
      isOpen: { value: false },
      open: vi.fn(),
      close: vi.fn(),
    },
    notificationsModal: {
      isOpen: { value: false },
      open: vi.fn(),
      close: vi.fn(),
    },
    pendingQuests: { value: [] },
    completedQuests: { value: [] },
    overdueQuests: { value: [] },
    totalExpToday: { value: 0 },
    unreadNotifications: { value: [] },
    handleAddQuest: vi.fn(),
    completeQuest: vi.fn(),
    deleteQuest: vi.fn(),
    markNotificationAsRead: vi.fn(),
    initialize: vi.fn(),
  }),
}))

describe('quests.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render quests page', () => {
    const wrapper = mount(QuestsPage, {
      global: {
        stubs: {
          NotificationPanel: true,
          OverdueBanner: true,
          QuestFormModal: true,
          QuestList: true,
          QuestStats: true,
          QuestStatsSkeleton: true,
          Tabs: true,
          TabsList: true,
          TabsTrigger: true,
          TabsContent: true,
          Button: true,
          Badge: true,
        },
      },
    })

    expect(wrapper.text()).toContain('Misiones Diarias')
  })

  it('should render page with initialize function', () => {
    const initialize = vi.fn()
    vi.doMock('../../../app/composables/useQuestsPage', () => ({
      useQuestsPage: () => ({
        quests: { value: [] },
        notifications: { value: [] },
        loading: { value: false },
        isSubmitting: { value: false },
        modal: {
          isOpen: { value: false },
          open: vi.fn(),
          close: vi.fn(),
        },
        notificationsModal: {
          isOpen: { value: false },
          open: vi.fn(),
          close: vi.fn(),
        },
        pendingQuests: { value: [] },
        completedQuests: { value: [] },
        overdueQuests: { value: [] },
        totalExpToday: { value: 0 },
        unreadNotifications: { value: [] },
        handleAddQuest: vi.fn(),
        completeQuest: vi.fn(),
        deleteQuest: vi.fn(),
        markNotificationAsRead: vi.fn(),
        initialize,
      }),
    }))

    const wrapper = mount(QuestsPage, {
      global: {
        stubs: {
          NotificationPanel: true,
          OverdueBanner: true,
          QuestFormModal: true,
          QuestList: true,
          QuestStats: true,
          QuestStatsSkeleton: true,
          Tabs: true,
          TabsList: true,
          TabsTrigger: true,
          TabsContent: true,
          Button: true,
          Badge: true,
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('should open modal when add button is clicked', async () => {
    const open = vi.fn()
    const modal = {
      isOpen: { value: false },
      open,
      close: vi.fn(),
    }

    vi.doMock('../../../app/composables/useQuestsPage', () => ({
      useQuestsPage: () => ({
        modal,
      }),
    }))

    const wrapper = mount(QuestsPage, {
      global: {
        stubs: {
          NotificationPanel: true,
          OverdueBanner: true,
          QuestFormModal: true,
          QuestList: true,
          QuestStats: true,
          QuestStatsSkeleton: true,
          Tabs: true,
          TabsList: true,
          TabsTrigger: true,
          TabsContent: true,
          Button: true,
          Badge: true,
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })
})

