import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';

import ArcadeMenu from '../../../../app/components/game/ArcadeMenu.vue';
import { useArcadeMenuStore } from '../../../../stores/useArcadeMenu';

// Mock modules store
vi.mock('../../../../stores/modules', () => ({
  useModulesStore: () => ({ enabledModules: [], getModuleById: () => undefined }),
}));

vi.mock('../../../../app/utils/nav-items', () => ({
  getAllNavItems: () => [
    { to: '/', label: 'Inicio', icon: null },
    { to: '/quests', label: 'Quests', icon: null },
  ],
}));

const mockNavigateTo = vi.fn();
vi.stubGlobal('navigateTo', mockNavigateTo);

describe('ArcadeMenu component (logic)', () => {
  let pinia: ReturnType<typeof createPinia>;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    vi.clearAllMocks();
  });

  it('(f) has role="dialog", aria-modal="true", non-empty aria-label when open', async () => {
    const arcadeMenuStore = useArcadeMenuStore();
    arcadeMenuStore.open();

    const wrapper = mount(ArcadeMenu, {
      global: { plugins: [pinia] },
      attachTo: document.body,
    });

    await wrapper.vm.$nextTick();

    // Component uses Teleport to body — check document.body
    const bodyHtml = document.body.innerHTML;
    expect(bodyHtml).toContain('role="dialog"');
    expect(bodyHtml).toContain('aria-modal="true"');
    expect(bodyHtml).toContain('aria-label=');

    wrapper.unmount();
  });

  it('(c) Escape key closes overlay', async () => {
    const arcadeMenuStore = useArcadeMenuStore();
    arcadeMenuStore.open();

    const wrapper = mount(ArcadeMenu, {
      global: { plugins: [pinia] },
      attachTo: document.body,
    });

    await wrapper.vm.$nextTick();
    expect(arcadeMenuStore.isOpen).toBe(true);

    // Dispatch Escape on the window — component listens there
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    await wrapper.vm.$nextTick();

    expect(arcadeMenuStore.isOpen).toBe(false);
    wrapper.unmount();
  });

  it('(g) backdrop click closes overlay', async () => {
    const arcadeMenuStore = useArcadeMenuStore();
    arcadeMenuStore.open();

    const wrapper = mount(ArcadeMenu, {
      global: { plugins: [pinia] },
      attachTo: document.body,
    });

    await wrapper.vm.$nextTick();

    const backdrop = wrapper.find('[data-backdrop]');
    if (backdrop.exists()) {
      await backdrop.trigger('click');
      expect(arcadeMenuStore.isOpen).toBe(false);
    } else {
      // backdrop is inside Teleport — check via document
      const backdropEl = document.querySelector('[data-backdrop]') as HTMLElement | null;
      backdropEl?.click();
      await wrapper.vm.$nextTick();
      expect(arcadeMenuStore.isOpen).toBe(false);
    }

    wrapper.unmount();
  });

  it('(d) entry click calls navigateTo + close()', async () => {
    const arcadeMenuStore = useArcadeMenuStore();
    arcadeMenuStore.open();

    const wrapper = mount(ArcadeMenu, {
      global: { plugins: [pinia] },
      attachTo: document.body,
    });

    await wrapper.vm.$nextTick();

    const entry = wrapper.find('[data-menu-entry]');
    if (entry.exists()) {
      await entry.trigger('click');
      expect(mockNavigateTo).toHaveBeenCalled();
      expect(arcadeMenuStore.isOpen).toBe(false);
    }

    wrapper.unmount();
  });

  it('(h) Tab on last focusable element wraps focus to first', async () => {
    const arcadeMenuStore = useArcadeMenuStore();
    arcadeMenuStore.open();

    const wrapper = mount(ArcadeMenu, {
      global: { plugins: [pinia] },
      attachTo: document.body,
    });

    await wrapper.vm.$nextTick();

    // Collect all focusable elements rendered in the Teleport
    const focusables = Array.from(
      document.querySelectorAll<HTMLElement>(
        '[role="dialog"] button, [role="dialog"] [tabindex="0"]',
      ),
    ).filter((el) => !el.hasAttribute('disabled'));

    expect(focusables.length).toBeGreaterThan(1);

    const lastEl = focusables[focusables.length - 1]!;
    const firstEl = focusables[0]!;

    // Focus the last element
    lastEl.focus();
    expect(document.activeElement).toBe(lastEl);

    // Dispatch Tab — component should wrap to first
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: false, bubbles: true }),
    );

    await wrapper.vm.$nextTick();

    expect(document.activeElement).toBe(firstEl);

    wrapper.unmount();
  });

  it('(i) Shift+Tab on first focusable element wraps focus to last', async () => {
    const arcadeMenuStore = useArcadeMenuStore();
    arcadeMenuStore.open();

    const wrapper = mount(ArcadeMenu, {
      global: { plugins: [pinia] },
      attachTo: document.body,
    });

    await wrapper.vm.$nextTick();

    const focusables = Array.from(
      document.querySelectorAll<HTMLElement>(
        '[role="dialog"] button, [role="dialog"] [tabindex="0"]',
      ),
    ).filter((el) => !el.hasAttribute('disabled'));

    expect(focusables.length).toBeGreaterThan(1);

    const firstEl = focusables[0]!;
    const lastEl = focusables[focusables.length - 1]!;

    // Focus the first element
    firstEl.focus();
    expect(document.activeElement).toBe(firstEl);

    // Dispatch Shift+Tab — component should wrap to last
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }),
    );

    await wrapper.vm.$nextTick();

    expect(document.activeElement).toBe(lastEl);

    wrapper.unmount();
  });
});
