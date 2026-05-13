import type { ModuleId } from '~~/domain/types';
import { useAuthStore } from '~~/stores/auth';

export interface UserModulePreference {
  module_id: ModuleId;
  enabled: boolean;
}

interface ApiUserModulePreference {
  moduleId: string;
  enabled: boolean;
}

interface ApiSaveUserModulesResponse {
  modules: ApiUserModulePreference[];
}

export function useUserModules() {
  const authStore = useAuthStore();
  const authContext = useAuthContext();
  const apiClient = useApiClient();

  async function refreshAuthContext() {
    try {
      await authContext.refresh();
    } catch {
      // noop: dejamos que el request falle normalizado
    }
  }

  function mapApiToLegacyShape(data: ApiUserModulePreference[]): UserModulePreference[] {
    return data.map((module) => ({
      module_id: module.moduleId as ModuleId,
      enabled: Boolean(module.enabled),
    }));
  }

  async function fetchUserModules(): Promise<UserModulePreference[]> {
    await refreshAuthContext();

    if (!authStore.userId && !authContext.getAccessToken()) {
      return [];
    }

    try {
      const modules = await apiClient.get<ApiUserModulePreference[]>('/v1/modules/me', {
        requireOrg: true,
      });

      return mapApiToLegacyShape(modules);
    } catch {
      return [];
    }
  }

  async function saveUserModules(modules: UserModulePreference[]): Promise<UserModulePreference[]> {
    await refreshAuthContext();

    if (!authStore.userId && !authContext.getAccessToken()) {
      return [];
    }

    const response = await apiClient.put<ApiSaveUserModulesResponse>(
      '/v1/modules/me',
      {
        modules: modules.map((module) => ({
          moduleId: module.module_id,
          enabled: Boolean(module.enabled),
        })),
      },
      {
        requireOrg: true,
      },
    );

    return mapApiToLegacyShape(response.modules);
  }

  return {
    fetchUserModules,
    saveUserModules,
  };
}
