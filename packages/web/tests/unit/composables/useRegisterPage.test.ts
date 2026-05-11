import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useRegisterPage } from '../../../app/composables/useRegisterPage'
import { useAuthStore } from '../../../stores/auth'

vi.mock('../../../app/composables/useAuth', () => ({
  useAuth: () => ({
    signUp: vi.fn().mockResolvedValue({ success: true }),
    signInWithGoogle: vi.fn().mockResolvedValue({}),
  }),
}))

describe('useRegisterPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('initialization', () => {
    it('should initialize with empty values', () => {
      const component = defineComponent({
        setup() {
          const { email, password, confirmPassword, showPassword, success } = useRegisterPage()
          return { email, password, confirmPassword, showPassword, success }
        },
        template: '<div></div>',
      })

      const wrapper = mount(component)
      expect(wrapper.vm.email).toBe('')
      expect(wrapper.vm.password).toBe('')
      expect(wrapper.vm.confirmPassword).toBe('')
      expect(wrapper.vm.showPassword).toBe(false)
      expect(wrapper.vm.success).toBe(false)
    })
  })

  describe('passwordsMatch', () => {
    it('should return true when passwords match', () => {
      const component = defineComponent({
        setup() {
          const { password, confirmPassword, passwordsMatch } = useRegisterPage()
          return { password, confirmPassword, passwordsMatch }
        },
        template: '<div></div>',
      })

      const wrapper = mount(component)
      wrapper.vm.password = 'test123'
      wrapper.vm.confirmPassword = 'test123'
      
      expect(wrapper.vm.passwordsMatch).toBe(true)
    })

    it('should return false when passwords do not match', () => {
      const component = defineComponent({
        setup() {
          const { password, confirmPassword, passwordsMatch } = useRegisterPage()
          return { password, confirmPassword, passwordsMatch }
        },
        template: '<div></div>',
      })

      const wrapper = mount(component)
      wrapper.vm.password = 'test123'
      wrapper.vm.confirmPassword = 'test456'
      
      expect(wrapper.vm.passwordsMatch).toBe(false)
    })
  })

  describe('isValidPassword', () => {
    it('should return true for password with 6+ characters', () => {
      const component = defineComponent({
        setup() {
          const { password, isValidPassword } = useRegisterPage()
          return { password, isValidPassword }
        },
        template: '<div></div>',
      })

      const wrapper = mount(component)
      wrapper.vm.password = 'test123'
      
      expect(wrapper.vm.isValidPassword).toBe(true)
    })

    it('should return false for password with less than 6 characters', () => {
      const component = defineComponent({
        setup() {
          const { password, isValidPassword } = useRegisterPage()
          return { password, isValidPassword }
        },
        template: '<div></div>',
      })

      const wrapper = mount(component)
      wrapper.vm.password = 'test'
      
      expect(wrapper.vm.isValidPassword).toBe(false)
    })
  })

  describe('passwordStrength', () => {
    it('should return 0 for empty password', () => {
      const component = defineComponent({
        setup() {
          const { passwordStrength } = useRegisterPage()
          return { passwordStrength }
        },
        template: '<div></div>',
      })

      const wrapper = mount(component)
      expect(wrapper.vm.passwordStrength).toBe(0)
    })

    it('should return 1 for password with 6+ characters', () => {
      const component = defineComponent({
        setup() {
          const { password, passwordStrength } = useRegisterPage()
          return { password, passwordStrength }
        },
        template: '<div></div>',
      })

      const wrapper = mount(component)
      wrapper.vm.password = 'test123'
      
      expect(wrapper.vm.passwordStrength).toBeGreaterThanOrEqual(1)
    })

    it('should return 2 for password with 10+ characters', () => {
      const component = defineComponent({
        setup() {
          const { password, passwordStrength } = useRegisterPage()
          return { password, passwordStrength }
        },
        template: '<div></div>',
      })

      const wrapper = mount(component)
      wrapper.vm.password = 'test123456'
      
      expect(wrapper.vm.passwordStrength).toBeGreaterThanOrEqual(2)
    })

    it('should return 3 for password with uppercase', () => {
      const component = defineComponent({
        setup() {
          const { password, passwordStrength } = useRegisterPage()
          return { password, passwordStrength }
        },
        template: '<div></div>',
      })

      const wrapper = mount(component)
      wrapper.vm.password = 'Test123456'
      
      expect(wrapper.vm.passwordStrength).toBeGreaterThanOrEqual(3)
    })

    it('should return 4 for password with numbers', () => {
      const component = defineComponent({
        setup() {
          const { password, passwordStrength } = useRegisterPage()
          return { password, passwordStrength }
        },
        template: '<div></div>',
      })

      const wrapper = mount(component)
      wrapper.vm.password = 'Test123456!'
      
      expect(wrapper.vm.passwordStrength).toBeGreaterThanOrEqual(4)
    })

    it('should cap at 4', () => {
      const component = defineComponent({
        setup() {
          const { password, passwordStrength } = useRegisterPage()
          return { password, passwordStrength }
        },
        template: '<div></div>',
      })

      const wrapper = mount(component)
      wrapper.vm.password = 'Test123456!@#$'
      
      expect(wrapper.vm.passwordStrength).toBeLessThanOrEqual(4)
    })
  })

  describe('strengthLabel', () => {
    it('should return correct label for each strength level', () => {
      const component = defineComponent({
        setup() {
          const { password, strengthLabel } = useRegisterPage()
          return { password, strengthLabel }
        },
        template: '<div></div>',
      })

      const wrapper = mount(component)
      
      wrapper.vm.password = 'test'
      expect(wrapper.vm.strengthLabel).toBe('')
      
      wrapper.vm.password = 'test123'
      expect(wrapper.vm.strengthLabel).toBe('Regular')
      
      wrapper.vm.password = 'test123456'
      expect(wrapper.vm.strengthLabel).toBe('Fuerte')
      
      wrapper.vm.password = 'Test123'
      expect(wrapper.vm.strengthLabel).toBe('Fuerte')
      
      wrapper.vm.password = 'Test123456!'
      expect(wrapper.vm.strengthLabel).toBe('¡Épica!')
    })
  })

  describe('strengthColor', () => {
    it('should return correct color for each strength level', () => {
      const component = defineComponent({
        setup() {
          const { password, strengthColor } = useRegisterPage()
          return { password, strengthColor }
        },
        template: '<div></div>',
      })

      const wrapper = mount(component)
      
      wrapper.vm.password = 'test123'
      expect(wrapper.vm.strengthColor).toBe('bg-exp-hard')
      
      wrapper.vm.password = 'test123456'
      expect(wrapper.vm.strengthColor).toBe('bg-exp-medium')
      
      wrapper.vm.password = 'Test123'
      expect(wrapper.vm.strengthColor).toBe('bg-exp-medium')
      
      wrapper.vm.password = 'Test123456!'
      expect(wrapper.vm.strengthColor).toBe('bg-exp-easy')
    })
  })

  describe('canSubmit', () => {
    it('should return false when email is empty', () => {
      const component = defineComponent({
        setup() {
          const { canSubmit } = useRegisterPage()
          return { canSubmit }
        },
        template: '<div></div>',
      })

      const wrapper = mount(component)
      // canSubmit returns email.value && ..., which returns '' when email is empty (falsy but not false)
      expect(wrapper.vm.canSubmit).toBeFalsy()
    })

    it('should return false when passwords do not match', () => {
      const component = defineComponent({
        setup() {
          const { email, password, confirmPassword, canSubmit } = useRegisterPage()
          return { email, password, confirmPassword, canSubmit }
        },
        template: '<div></div>',
      })

      const wrapper = mount(component)
      wrapper.vm.email = 'test@test.com'
      wrapper.vm.password = 'test123'
      wrapper.vm.confirmPassword = 'test456'
      
      expect(wrapper.vm.canSubmit).toBe(false)
    })

    it('should return false when password is invalid', () => {
      const component = defineComponent({
        setup() {
          const { email, password, confirmPassword, canSubmit } = useRegisterPage()
          return { email, password, confirmPassword, canSubmit }
        },
        template: '<div></div>',
      })

      const wrapper = mount(component)
      wrapper.vm.email = 'test@test.com'
      wrapper.vm.password = 'test'
      wrapper.vm.confirmPassword = 'test'
      
      expect(wrapper.vm.canSubmit).toBe(false)
    })

    it('should return true when all conditions are met', () => {
      const component = defineComponent({
        setup() {
          const { email, password, confirmPassword, canSubmit } = useRegisterPage()
          return { email, password, confirmPassword, canSubmit }
        },
        template: '<div></div>',
      })

      const wrapper = mount(component)
      wrapper.vm.email = 'test@test.com'
      wrapper.vm.password = 'test123'
      wrapper.vm.confirmPassword = 'test123'
      
      expect(wrapper.vm.canSubmit).toBe(true)
    })
  })

  describe('handleSubmit', () => {
    it('should set success to true on successful signup', async () => {
      const component = defineComponent({
        setup() {
          const { email, password, confirmPassword, success, handleSubmit } = useRegisterPage()
          return { email, password, confirmPassword, success, handleSubmit }
        },
        template: '<div></div>',
      })

      const wrapper = mount(component)
      wrapper.vm.email = 'test@test.com'
      wrapper.vm.password = 'test123'
      wrapper.vm.confirmPassword = 'test123'
      
      await wrapper.vm.handleSubmit()
      
      expect(wrapper.vm.success).toBe(true)
    })
  })

  describe('reset', () => {
    it('should reset all values to initial state', () => {
      const component = defineComponent({
        setup() {
          const { email, password, confirmPassword, showPassword, success, reset } = useRegisterPage()
          return { email, password, confirmPassword, showPassword, success, reset }
        },
        template: '<div></div>',
      })

      const wrapper = mount(component)
      wrapper.vm.email = 'test@test.com'
      wrapper.vm.password = 'test123'
      wrapper.vm.confirmPassword = 'test123'
      wrapper.vm.showPassword = true
      wrapper.vm.success = true
      
      wrapper.vm.reset()
      
      expect(wrapper.vm.email).toBe('')
      expect(wrapper.vm.password).toBe('')
      expect(wrapper.vm.confirmPassword).toBe('')
      expect(wrapper.vm.showPassword).toBe(false)
      expect(wrapper.vm.success).toBe(false)
    })
  })
})

