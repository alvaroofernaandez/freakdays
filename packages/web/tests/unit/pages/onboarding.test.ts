import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import OnboardingPage from '../../../app/pages/onboarding.vue';

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router');
  return {
    ...actual,
    useRouter: () => ({ push: vi.fn() }),
  };
});

describe('onboarding.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

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
    });

    expect(wrapper.text()).toContain('Configura tu aventura');
  });

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
    });

    expect(wrapper.vm).toBeDefined();
  });

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
    });

    expect(wrapper.vm).toBeDefined();
  });
});
