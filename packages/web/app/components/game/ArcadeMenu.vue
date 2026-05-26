<script setup lang="ts">
import { useArcadeMenuStore } from '~~/stores/useArcadeMenu';
import { useModulesStore } from '~~/stores/modules';
import { getAllNavItems } from '@/utils/nav-items';
import type { NavItem } from '@/utils/nav-items';

const arcadeMenuStore = useArcadeMenuStore();
const modulesStore = useModulesStore();

const navItems = computed<NavItem[]>(() => getAllNavItems(modulesStore));

const panelRef = ref<HTMLElement | null>(null);
const focusedIndex = ref(0);

function selectItem(item: NavItem) {
  navigateTo(item.to);
  arcadeMenuStore.close();
}

function getFocusableElements(): HTMLElement[] {
  if (!import.meta.client) return [];
  const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
  if (!dialog) return [];
  return Array.from(
    dialog.querySelectorAll<HTMLElement>('button:not([disabled]), [tabindex="0"]:not([disabled])'),
  );
}

function handleKeydown(e: KeyboardEvent) {
  if (!arcadeMenuStore.isOpen) return;

  if (e.key === 'Escape') {
    arcadeMenuStore.close();
    return;
  }

  if (e.key === 'Tab') {
    const focusables = getFocusableElements();
    if (focusables.length === 0) return;
    const firstEl = focusables[0]!;
    const lastEl = focusables[focusables.length - 1]!;

    if (e.shiftKey) {
      // Shift+Tab from first → wrap to last
      if (document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      }
    } else {
      // Tab from last → wrap to first
      if (document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
    return;
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    focusedIndex.value = (focusedIndex.value + 1) % navItems.value.length;
    focusEntry(focusedIndex.value);
    return;
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault();
    focusedIndex.value = (focusedIndex.value - 1 + navItems.value.length) % navItems.value.length;
    focusEntry(focusedIndex.value);
    return;
  }
}

function focusEntry(index: number) {
  if (!import.meta.client) return;
  const panel = panelRef.value;
  if (!panel) return;
  const entries = panel.querySelectorAll<HTMLElement>('[data-menu-entry]');
  entries[index]?.focus();
}

function handleEntryKeydown(e: KeyboardEvent, item: NavItem) {
  if (e.key === 'Enter') {
    selectItem(item);
  }
}

watch(
  () => arcadeMenuStore.isOpen,
  async (isOpen) => {
    if (isOpen) {
      focusedIndex.value = 0;
      await nextTick();
      focusEntry(0);
    } else {
      // Restore focus to trigger element
      if (import.meta.client && arcadeMenuStore.triggerEl) {
        arcadeMenuStore.triggerEl.focus();
      }
    }
  },
);

onMounted(() => {
  if (import.meta.client) {
    window.addEventListener('keydown', handleKeydown);
  }
});

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('keydown', handleKeydown);
  }
});
</script>

<template>
  <Teleport to="body">
    <template v-if="arcadeMenuStore.isOpen">
      <div class="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label="Menú">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/70 backdrop-blur-sm"
          data-backdrop
          @click="arcadeMenuStore.close()"
        />

        <!-- Panel -->
        <div
          ref="panelRef"
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm pixel-frame glass p-6"
        >
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <p class="font-pixel text-xs text-primary uppercase tracking-widest">Menú</p>
            <button
              class="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Cerrar menú"
              @click="arcadeMenuStore.close()"
            >
              ×
            </button>
          </div>

          <!-- Entries -->
          <nav>
            <ul class="space-y-1" role="list">
              <li v-for="(item, index) in navItems" :key="item.to">
                <button
                  class="w-full text-left px-4 py-3 font-pixel text-xs rounded-none hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus:bg-primary/10 transition-colors"
                  :class="{ 'bg-primary/10': focusedIndex === index }"
                  data-menu-entry
                  tabindex="0"
                  @click="selectItem(item)"
                  @keydown="handleEntryKeydown($event, item)"
                >
                  {{ item.label }}
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </template>
  </Teleport>
</template>
