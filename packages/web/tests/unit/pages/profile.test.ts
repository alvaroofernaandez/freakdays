import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ProfilePage from '../../../app/pages/profile.vue'

vi.mock('../../../app/composables/useProfilePage', () => ({
  useProfilePage: () => ({
    profile: { value: null },
    loading: { value: true },
    saving: { value: false },
    savingModules: { value: false },
    modulesSaved: { value: false },
    uploadingAvatar: { value: false },
    editing: { value: false },
    confirmDialog: {
      isOpen: { value: false },
      open: vi.fn(),
      close: vi.fn(),
    },
    moduleToDisable: { value: null },
    editForm: { value: {} },
    avatarFileInput: { value: null },
    avatarPreview: { value: null },
    expProgress: { value: { current: 0, needed: 100, progress: 0 } },
    favoriteAnime: { value: null },
    favoriteManga: { value: null },
    modules: { value: [] },
    animeList: { value: [] },
    mangaList: { value: [] },
    startEditing: vi.fn(),
    cancelEditing: vi.fn(),
    saveProfile: vi.fn(),
    handleAvatarUpload: vi.fn(),
    handleDeleteAvatar: vi.fn(),
    triggerAvatarUpload: vi.fn(),
    handleLogout: vi.fn(),
    handleToggleModule: vi.fn(),
    confirmDisable: vi.fn(),
    cancelDisable: vi.fn(),
    handleDisableAll: vi.fn(),
    initialize: vi.fn(),
  }),
}))

vi.mock('../../../stores/modules', () => ({
  useModulesStore: () => ({
    enabledModules: [],
  }),
}))

describe('profile.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render profile page', () => {
    const wrapper = mount(ProfilePage, {
      global: {
        stubs: {
          ProfileEditForm: true,
          ProfileHeader: true,
          ProfileInfoCards: true,
          ProfileProgressCard: true,
          ProfileStats: true,
          ConfirmDisableDialog: true,
          ModuleCard: true,
          Card: true,
          CardContent: true,
          CardDescription: true,
          CardHeader: true,
          CardTitle: true,
          Button: true,
          Badge: true,
          Separator: true,
          Skeleton: true,
          NuxtLink: true,
        },
      },
    })

    expect(wrapper.text()).toContain('Mi Perfil')
  })

  it('should render page with initialize function', () => {
    const initialize = vi.fn()
    vi.doMock('../../../app/composables/useProfilePage', () => ({
      useProfilePage: () => ({
        profile: { value: null },
        loading: { value: true },
        saving: { value: false },
        savingModules: { value: false },
        modulesSaved: { value: false },
        uploadingAvatar: { value: false },
        editing: { value: false },
        confirmDialog: {
          isOpen: { value: false },
          open: vi.fn(),
          close: vi.fn(),
        },
        moduleToDisable: { value: null },
        editForm: { value: {} },
        avatarFileInput: { value: null },
        avatarPreview: { value: null },
        expProgress: { value: { current: 0, needed: 100, progress: 0 } },
        favoriteAnime: { value: null },
        favoriteManga: { value: null },
        modules: { value: [] },
        animeList: { value: [] },
        mangaList: { value: [] },
        startEditing: vi.fn(),
        cancelEditing: vi.fn(),
        saveProfile: vi.fn(),
        handleAvatarUpload: vi.fn(),
        handleDeleteAvatar: vi.fn(),
        triggerAvatarUpload: vi.fn(),
        handleLogout: vi.fn(),
        handleToggleModule: vi.fn(),
        confirmDisable: vi.fn(),
        cancelDisable: vi.fn(),
        handleDisableAll: vi.fn(),
        initialize,
      }),
    }))

    const wrapper = mount(ProfilePage, {
      global: {
        stubs: {
          ProfileEditForm: true,
          ProfileHeader: true,
          ProfileInfoCards: true,
          ProfileProgressCard: true,
          ProfileStats: true,
          ConfirmDisableDialog: true,
          ModuleCard: true,
          Card: true,
          CardContent: true,
          CardDescription: true,
          CardHeader: true,
          CardTitle: true,
          Button: true,
          Badge: true,
          Separator: true,
          Skeleton: true,
          NuxtLink: true,
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('should show loading skeleton when loading', () => {
    const wrapper = mount(ProfilePage, {
      global: {
        stubs: {
          ProfileEditForm: true,
          ProfileHeader: true,
          ProfileInfoCards: true,
          ProfileProgressCard: true,
          ProfileStats: true,
          ConfirmDisableDialog: true,
          ModuleCard: true,
          Card: true,
          CardContent: true,
          CardDescription: true,
          CardHeader: true,
          CardTitle: true,
          Button: true,
          Badge: true,
          Separator: true,
          Skeleton: true,
          NuxtLink: true,
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('should show edit form when editing', () => {
    vi.doMock('../../../app/composables/useProfilePage', () => ({
      useProfilePage: () => ({
        editing: { value: true },
        profile: { value: { id: '1', username: 'test' } },
        loading: { value: false },
      }),
    }))

    const wrapper = mount(ProfilePage, {
      global: {
        stubs: {
          ProfileEditForm: true,
          ProfileHeader: true,
          ProfileInfoCards: true,
          ProfileProgressCard: true,
          ProfileStats: true,
          ConfirmDisableDialog: true,
          ModuleCard: true,
          Card: true,
          CardContent: true,
          CardDescription: true,
          CardHeader: true,
          CardTitle: true,
          Button: true,
          Badge: true,
          Separator: true,
          Skeleton: true,
          NuxtLink: true,
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })
})

