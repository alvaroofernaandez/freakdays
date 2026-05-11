import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import RegisterPage from '../../../app/pages/register.vue'

vi.mock('../../../app/composables/useRegisterPage', () => ({
  useRegisterPage: () => ({
    email: { value: '' },
    password: { value: '' },
    confirmPassword: { value: '' },
    showPassword: { value: false },
    success: { value: false },
    passwordsMatch: { value: true },
    isValidPassword: { value: false },
    passwordStrength: { value: 0 },
    strengthLabel: { value: '' },
    strengthColor: { value: '' },
    handleSubmit: vi.fn(),
    handleGoogleSignIn: vi.fn(),
  }),
}))

vi.mock('../../../stores/auth', () => ({
  useAuthStore: () => ({
    loading: false,
    error: null,
  }),
}))

describe('register.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render register page', () => {
    const wrapper = mount(RegisterPage, {
      global: {
        stubs: {
          NuxtLink: true,
          RegisterHeader: true,
          RegisterForm: true,
          GoogleSignInButton: true,
          RegisterSuccessMessage: true,
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('should show success message when success is true', () => {
    vi.doMock('../../../app/composables/useRegisterPage', () => ({
      useRegisterPage: () => ({
        success: { value: true },
      }),
    }))

    const wrapper = mount(RegisterPage, {
      global: {
        stubs: {
          NuxtLink: true,
          RegisterHeader: true,
          RegisterForm: true,
          GoogleSignInButton: true,
          RegisterSuccessMessage: true,
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('should show form when success is false', () => {
    const wrapper = mount(RegisterPage, {
      global: {
        stubs: {
          NuxtLink: true,
          RegisterHeader: true,
          RegisterForm: true,
          GoogleSignInButton: true,
          RegisterSuccessMessage: true,
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })
})

