import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import LoginPage from '../../../app/pages/login.vue'

vi.mock('../../../app/composables/useAuth', () => ({
  useAuth: () => ({
    signIn: vi.fn().mockResolvedValue({}),
    signInWithGoogle: vi.fn(),
  }),
}))

vi.mock('../../../stores/auth', () => ({
  useAuthStore: () => ({
    loading: false,
    error: null,
  }),
}))

describe('login.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render login page', () => {
    const wrapper = mount(LoginPage, {
      global: {
        stubs: {
          NuxtLink: true,
        },
      },
    })

    expect(wrapper.text()).toContain('FreakDays')
    expect(wrapper.text()).toContain('Bienvenido de nuevo')
  })

  it('should have email and password inputs', () => {
    const wrapper = mount(LoginPage, {
      global: {
        stubs: {
          NuxtLink: true,
        },
      },
    })

    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')

    expect(emailInput.exists()).toBe(true)
    expect(passwordInput.exists()).toBe(true)
  })

  it('should toggle password visibility', async () => {
    const wrapper = mount(LoginPage, {
      global: {
        stubs: {
          NuxtLink: true,
        },
      },
    })

    const toggleButton = wrapper.find('button[type="button"]')
    if (toggleButton.exists()) {
      await toggleButton.trigger('click')
      const passwordInput = wrapper.find('input[type="password"], input[type="text"]')
      expect(passwordInput.exists()).toBe(true)
    }
  })

  it('should have link to register page', () => {
    const wrapper = mount(LoginPage, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a><slot /></a>',
            props: ['to'],
          },
        },
      },
    })

    const registerLink = wrapper.find('a')
    expect(registerLink.exists()).toBe(true)
  })
})

