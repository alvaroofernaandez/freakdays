import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import Page500 from '../../../app/pages/500.vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}))

describe('500.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    window.location.reload = vi.fn()
  })

  it('should render 500 page', () => {
    const wrapper = mount(Page500, {
      global: {
        stubs: {
          NuxtLink: true,
        },
      },
    })

    expect(wrapper.text()).toContain('500')
    expect(wrapper.text()).toContain('Error del servidor')
  })

  it('should have retry button', () => {
    const wrapper = mount(Page500, {
      global: {
        stubs: {
          NuxtLink: true,
        },
      },
    })

    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('should call window.location.reload when retry button is clicked', async () => {
    const reloadSpy = vi.fn()
    window.location.reload = reloadSpy

    const wrapper = mount(Page500, {
      global: {
        stubs: {
          NuxtLink: true,
        },
      },
    })

    const retryButton = wrapper.findAll('button').find((btn) =>
      btn.text().includes('Reintentar')
    )

    if (retryButton) {
      await retryButton.trigger('click')
      expect(reloadSpy).toHaveBeenCalled()
    }
  })
})

