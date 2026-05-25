import { describe, it, expect, vi } from 'vitest';
import { ref } from 'vue';
import { mount } from '@vue/test-utils';
import ToastContainer from '../../../app/components/ToastContainer.vue';

const mockRemove = vi.fn();

vi.mock('../../../app/composables/useToast', () => ({
  useToast: () => ({
    toasts: ref([
      { id: '1', message: 'Test message', type: 'success' },
      { id: '2', message: 'Error message', type: 'error' },
    ]),
    remove: mockRemove,
  }),
}));

describe('ToastContainer.vue', () => {
  it('should render toast container', () => {
    const wrapper = mount(ToastContainer, {
      global: {
        stubs: {
          ClientOnly: true,
          Teleport: true,
          TransitionGroup: true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('should render toasts with type labels and close button', () => {
    const wrapper = mount(ToastContainer, {
      global: {
        stubs: {
          ClientOnly: {
            template: '<div><slot /></div>',
          },
          Teleport: {
            template: '<div><slot /></div>',
          },
          TransitionGroup: {
            template: '<div><slot /></div>',
          },
        },
      },
    });

    const text = wrapper.text();
    // Rendered type labels from styleMap
    expect(text).toContain('ÉXITO');
    expect(text).toContain('ERROR');
    // Toast messages
    expect(text).toContain('Test message');
    expect(text).toContain('Error message');
    // Close button accessible label
    const closeButtons = wrapper.findAll('button[aria-label="Cerrar notificación"]');
    expect(closeButtons.length).toBe(2);
  });
});
