import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

import StatCard from '../../../../app/components/index/StatCard.vue';

// Minimal stub icon component to satisfy the `icon: Component` prop.
const StubIcon = defineComponent({
  name: 'StubIcon',
  render() {
    return h('svg', { 'data-testid': 'stub-icon' });
  },
});

const defaultProps = {
  label: 'Total EXP',
  value: 1_200,
  icon: StubIcon,
  colorVariant: 'primary' as const,
};

describe('StatCard.vue', () => {
  it('renders label text', () => {
    const wrapper = mount(StatCard, {
      props: defaultProps,
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' },
          CardContent: { template: '<div><slot /></div>' },
        },
      },
    });

    expect(wrapper.text()).toContain('Total EXP');
  });

  it('renders the numeric value', () => {
    const wrapper = mount(StatCard, {
      props: defaultProps,
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' },
          CardContent: { template: '<div><slot /></div>' },
        },
      },
    });

    expect(wrapper.text()).toContain('1200');
  });

  it('renders a string value', () => {
    const wrapper = mount(StatCard, {
      props: { ...defaultProps, value: '42 / 100' },
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' },
          CardContent: { template: '<div><slot /></div>' },
        },
      },
    });

    expect(wrapper.text()).toContain('42 / 100');
  });

  it.each(['primary', 'accent', 'exp-easy', 'exp-legendary'] as const)(
    'renders without errors for colorVariant="%s"',
    (colorVariant) => {
      const wrapper = mount(StatCard, {
        props: { ...defaultProps, colorVariant },
        global: {
          stubs: {
            Card: { template: '<div><slot /></div>' },
            CardContent: { template: '<div><slot /></div>' },
          },
        },
      });

      expect(wrapper.exists()).toBe(true);
    },
  );

  it('renders the icon component', () => {
    const wrapper = mount(StatCard, {
      props: defaultProps,
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' },
          CardContent: { template: '<div><slot /></div>' },
        },
      },
    });

    // The dynamic component renders StubIcon which produces an <svg>.
    expect(wrapper.find('svg').exists()).toBe(true);
  });
});
