import { defineStore } from "pinia";
import type { AppModule, ModuleId } from "~~/domain/types/modules";
import { ALL_MODULES } from "~~/domain/types/modules";

interface ModuleState {
  modules: AppModule[];
  synced: boolean;
  moduleMap: Record<ModuleId, boolean>;
}

export const useModulesStore = defineStore("modules", {
  state: (): ModuleState => ({
    modules: ALL_MODULES.map((m) => ({ ...m, enabled: false })),
    synced: false,
    moduleMap: {} as Record<ModuleId, boolean>,
  }),

  getters: {
    isEnabled:
      (state) =>
      (moduleId: ModuleId): boolean => {
        return state.moduleMap[moduleId] ?? false;
      },

    enabledModules: (state): AppModule[] => {
      return state.modules.filter((m) => state.moduleMap[m.id] ?? m.enabled);
    },

    hasCompletedOnboarding: (state): boolean => {
      return state.synced && state.modules.some((m) => m.enabled);
    },

    getModuleById:
      (state) =>
      (moduleId: ModuleId): AppModule | undefined => {
        return state.modules.find((m) => m.id === moduleId);
      },
  },

  actions: {
    setModule(moduleId: ModuleId, enabled: boolean) {
      // Use $patch to ensure reactivity
      this.$patch((state) => {
        state.moduleMap = { ...state.moduleMap, [moduleId]: enabled };
        const moduleIndex = state.modules.findIndex((m) => m.id === moduleId);
        if (moduleIndex !== -1) {
          const module = state.modules[moduleIndex];
          if (module) {
            state.modules[moduleIndex] = {
              id: module.id,
              name: module.name,
              description: module.description,
              icon: module.icon,
              enabled,
            };
          }
        }
      });
    },

    toggleModule(moduleId: ModuleId) {
      const current = this.moduleMap[moduleId] ?? false;
      this.setModule(moduleId, !current);
    },

    enableModules(moduleIds: ModuleId[]) {
      moduleIds.forEach((id) => {
        this.setModule(id, true);
      });
    },

    disableAllModules() {
      this.modules.forEach((module) => {
        this.setModule(module.id, false);
      });
    },

    setModulesFromDb(data: Array<{ module_id: ModuleId; enabled: boolean }>) {
      // Create a fresh moduleMap object with all modules initialized as disabled
      const newModuleMap = {} as Record<ModuleId, boolean>;

      // Initialize all modules as disabled first
      ALL_MODULES.forEach((module) => {
        newModuleMap[module.id] = false;
      });

      // Then set enabled modules from database
      data.forEach(({ module_id, enabled }) => {
        // enabled is already a boolean from Supabase
        const isEnabled = Boolean(enabled);
        newModuleMap[module_id] = isEnabled;

        // Update the modules array
        const moduleIndex = this.modules.findIndex((m) => m.id === module_id);
        if (moduleIndex !== -1) {
          const module = this.modules[moduleIndex];
          if (module) {
            this.modules[moduleIndex] = {
              id: module.id,
              name: module.name,
              description: module.description,
              icon: module.icon,
              enabled: isEnabled,
            };
          }
        }
      });

      // Use $patch to ensure reactivity
      this.$patch({
        moduleMap: { ...newModuleMap },
        synced: true,
      });
    },

    async syncToDatabase(supabase: any, userId: string) {
      const enabledModules = this.modules.filter((m) => m.enabled);

      for (const module of ALL_MODULES) {
        const isEnabled = this.moduleMap[module.id] ?? false;

        const { error: upsertError } = await supabase
          .from("user_modules")
          .upsert(
            {
              user_id: userId,
              module_id: module.id,
              enabled: isEnabled,
              enabled_at: isEnabled ? new Date().toISOString() : null,
            },
            {
              onConflict: "user_id,module_id",
            }
          );

        if (upsertError) {
          console.error(`Error syncing module ${module.id}:`, upsertError);
          throw upsertError;
        }
      }

      this.synced = true;
    },

    reset() {
      this.modules = ALL_MODULES.map((m) => ({ ...m, enabled: false }));
      this.moduleMap = {} as Record<ModuleId, boolean>;
      this.synced = false;
    },
  },
});
