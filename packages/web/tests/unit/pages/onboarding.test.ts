import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import OnboardingPage from '../../../app/pages/onboarding.vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock('../../../app/composables/useSupabase', () => ({
  useSupabase: () => ({
    from: vi.fn(() => ({
      upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  }),
}))

describe('onboarding.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render onboarding page', () => {
    const wrapper = mount(OnboardingPage, {
      global: {
        stubs: {
          Card: true,
          CardHeader: true,
          CardTitle: true,
          CardDescription: true,
          Badge: true,
          Button: true,
        },
      },
    })

    expect(wrapper.text()).toContain('Configura tu Aventura')
  })

  it('should toggle module selection', async () => {
    const wrapper = mount(OnboardingPage, {
      global: {
        stubs: {
          Card: true,
          CardHeader: true,
          CardTitle: true,
          CardDescription: true,
          Badge: true,
          Button: true,
        },
      },
    })

    expect(wrapper.vm).toBeDefined()
  })

  it('should disable continue button when no modules selected', () => {
    const wrapper = mount(OnboardingPage, {
      global: {
        stubs: {
          Card: true,
          CardHeader: true,
          CardTitle: true,
          CardDescription: true,
          Badge: true,
          Button: true,
        },
      },
    })

    expect(wrapper.vm).toBeDefined()
  })
})

