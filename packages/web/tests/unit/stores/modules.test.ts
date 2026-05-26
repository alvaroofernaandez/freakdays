import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppModule, ModuleId } from '../../../domain/types';
import { useModulesStore } from '../../../stores/modules';

describe('useModulesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('initialization', () => {
    it('should initialize with all modules disabled', () => {
      const store = useModulesStore();

      expect(store.modules).toHaveLength(6);
      store.modules.forEach((module: AppModule) => {
        expect(module.enabled).toBe(false);
      });
    });

    it('should contain all expected module IDs', () => {
      const store = useModulesStore();
      const expectedIds: ModuleId[] = ['workouts', 'manga', 'anime', 'quests', 'party', 'calendar'];

      expectedIds.forEach((id) => {
        const module = store.modules.find((m: AppModule) => m.id === id);
        expect(module).toBeDefined();
      });
    });
  });

  describe('toggleModule', () => {
    it('should disable a module that is enabled by default', () => {
      const store = useModulesStore();

      // All modules are enabled by default (moduleMap). First toggle disables.
      store.toggleModule('quests');

      const module = store.getModuleById('quests');
      expect(module?.enabled).toBe(false);
      expect(store.isEnabled('quests')).toBe(false);
    });

    it('should re-enable a module after two toggles', () => {
      const store = useModulesStore();

      // starts enabled → first toggle disables → second toggle re-enables
      store.toggleModule('quests');
      store.toggleModule('quests');

      const module = store.getModuleById('quests');
      expect(module?.enabled).toBe(true);
      expect(store.isEnabled('quests')).toBe(true);
    });

    it('should not affect other modules when toggling', () => {
      const store = useModulesStore();

      // Disable quests; other modules keep their moduleMap state (enabled by default)
      store.toggleModule('quests');

      const otherModules = store.modules.filter((m: AppModule) => m.id !== 'quests');
      otherModules.forEach((module: AppModule) => {
        // modules array still reflects enabled: false until explicitly updated via setModule
        // the source of truth for display is moduleMap (checked via isEnabled)
        expect(store.isEnabled(module.id)).toBe(true);
      });
    });
  });

  describe('enableModules', () => {
    it('should enable multiple modules at once', () => {
      const store = useModulesStore();

      store.enableModules(['quests', 'anime', 'manga']);

      expect(store.getModuleById('quests')?.enabled).toBe(true);
      expect(store.getModuleById('anime')?.enabled).toBe(true);
      expect(store.getModuleById('manga')?.enabled).toBe(true);
      expect(store.getModuleById('workouts')?.enabled).toBe(false);
    });
  });

  describe('disableAllModules', () => {
    it('should disable all modules', () => {
      const store = useModulesStore();

      store.enableModules(['quests', 'anime']);
      store.disableAllModules();

      store.modules.forEach((module: AppModule) => {
        expect(module.enabled).toBe(false);
      });
    });
  });

  describe('setModule', () => {
    it('should enable a module', () => {
      const store = useModulesStore();

      store.setModule('quests', true);

      expect(store.isEnabled('quests')).toBe(true);
      expect(store.getModuleById('quests')?.enabled).toBe(true);
    });

    it('should disable a module', () => {
      const store = useModulesStore();

      store.setModule('quests', true);
      store.setModule('quests', false);

      expect(store.isEnabled('quests')).toBe(false);
      expect(store.getModuleById('quests')?.enabled).toBe(false);
    });

    it('should update moduleMap when setting module', () => {
      const store = useModulesStore();

      store.setModule('anime', true);

      expect(store.moduleMap.anime).toBe(true);
    });
  });

  describe('computed getters', () => {
    it('should return all modules enabled by default', () => {
      const store = useModulesStore();

      // All 6 modules are on by default via the pre-seeded moduleMap
      expect(store.enabledModules).toHaveLength(6);
    });

    it('should return fewer modules after explicitly disabling some', () => {
      const store = useModulesStore();

      store.setModule('quests', false);
      store.setModule('manga', false);

      expect(store.enabledModules).toHaveLength(4);
      expect(store.enabledModules.map((m) => m.id)).not.toContain('quests');
      expect(store.enabledModules.map((m) => m.id)).not.toContain('manga');
    });

    it('should correctly report if onboarding is complete', () => {
      const store = useModulesStore();

      expect(store.hasCompletedOnboarding).toBe(false);

      store.enableModules(['quests']);
      store.synced = true;

      expect(store.hasCompletedOnboarding).toBe(true);
    });

    it('should return false for hasCompletedOnboarding when not synced', () => {
      const store = useModulesStore();

      store.enableModules(['quests']);
      store.synced = false;

      expect(store.hasCompletedOnboarding).toBe(false);
    });

    it('should return false for hasCompletedOnboarding when no modules enabled', () => {
      const store = useModulesStore();

      store.synced = true;

      expect(store.hasCompletedOnboarding).toBe(false);
    });

    it('isEnabled should return true for any module by default', () => {
      const store = useModulesStore();

      // All modules are enabled by default via pre-seeded moduleMap
      expect(store.isEnabled('quests')).toBe(true);
    });

    it('isEnabled should return false after explicitly disabling a module', () => {
      const store = useModulesStore();

      store.setModule('quests', false);
      expect(store.isEnabled('quests')).toBe(false);
    });

    it('isEnabled should return true for enabled module', () => {
      const store = useModulesStore();

      store.setModule('quests', true);

      expect(store.isEnabled('quests')).toBe(true);
    });

    it('isEnabled should return false for unknown module', () => {
      const store = useModulesStore();

      expect(store.isEnabled('unknown' as ModuleId)).toBe(false);
    });

    it('getModuleById should return module when found', () => {
      const store = useModulesStore();

      const module = store.getModuleById('quests');

      expect(module).toBeDefined();
      expect(module?.id).toBe('quests');
    });

    it('getModuleById should return undefined for unknown module', () => {
      const store = useModulesStore();

      const module = store.getModuleById('unknown' as ModuleId);

      expect(module).toBeUndefined();
    });
  });

  describe('setModulesFromDb', () => {
    it('should set modules from database data', () => {
      const store = useModulesStore();

      store.setModulesFromDb([
        { module_id: 'quests', enabled: true },
        { module_id: 'anime', enabled: true },
        { module_id: 'manga', enabled: false },
      ]);

      expect(store.isEnabled('quests')).toBe(true);
      expect(store.isEnabled('anime')).toBe(true);
      expect(store.isEnabled('manga')).toBe(false);
      expect(store.synced).toBe(true);
    });

    it('should mark as synced after setting modules', () => {
      const store = useModulesStore();

      expect(store.synced).toBe(false);

      store.setModulesFromDb([{ module_id: 'quests', enabled: true }]);

      expect(store.synced).toBe(true);
    });
  });

  describe('syncToDatabase', () => {
    it('PUTs the current module state to /api/modules and marks synced', async () => {
      const store = useModulesStore();
      const fetchMock = vi.fn().mockResolvedValue({ modules: [] });
      vi.stubGlobal('$fetch', fetchMock);

      store.setModule('quests', true);
      store.setModule('anime', false);

      await store.syncToDatabase();

      expect(store.synced).toBe(true);
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/modules',
        expect.objectContaining({ method: 'PUT' }),
      );
      const body = fetchMock.mock.calls[0]?.[1]?.body as {
        modules: Array<{ moduleId: string; enabled: boolean }>;
      };
      expect(body.modules).toContainEqual({ moduleId: 'quests', enabled: true });
      expect(body.modules).toContainEqual({ moduleId: 'anime', enabled: false });
    });
  });

  describe('reset', () => {
    it('should reset modules array to disabled state and restore default moduleMap', () => {
      const store = useModulesStore();

      store.enableModules(['quests', 'anime', 'manga']);
      store.synced = true;
      store.reset();

      // modules array entries go back to enabled: false (catalog default)
      expect(store.modules.every((m: AppModule) => !m.enabled)).toBe(true);
      // moduleMap is rebuilt with all modules enabled (default behavior)
      expect(Object.keys(store.moduleMap).length).toBe(6);
      expect(store.isEnabled('quests')).toBe(true);
      expect(store.synced).toBe(false);
    });

    it('should reset moduleMap to all-enabled default', () => {
      const store = useModulesStore();

      store.setModule('quests', false);
      store.reset();

      // After reset, moduleMap is back to all-on defaults
      expect(store.isEnabled('quests')).toBe(true);
      expect(Object.keys(store.moduleMap).length).toBe(6);
    });
  });
});
