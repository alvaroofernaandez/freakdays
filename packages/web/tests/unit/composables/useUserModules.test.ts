import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

import { useUserModules } from '../../../app/composables/useUserModules';
import { useAuthStore } from '../../../stores/auth';

const mockApi = {
  get: vi.fn(),
  put: vi.fn(),
  normalizeApiError: vi.fn((error: unknown) => {
    if (typeof error === 'object' && error !== null) {
      return error as { statusCode?: number; message: string };
    }

    return { message: 'unknown' };
  }),
};

vi.mock('../../../app/composables/useApiClient', () => ({
  useApiClient: () => mockApi,
}));

describe('useUserModules', () => {
  beforeAll(() => {
    vi.stubGlobal('useAuthContext', () => ({
      refresh: vi.fn().mockResolvedValue(undefined),
    }));
  });

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    const authStore = useAuthStore();
    authStore.setSession({ user: { id: 'user-1' } } as never);
  });

  it('consulta módulos en backend Nest con requireOrg', async () => {
    mockApi.get.mockResolvedValue([
      { moduleId: 'anime', enabled: true },
      { moduleId: 'quests', enabled: false },
    ]);

    const userModules = useUserModules();
    const modules = await userModules.fetchUserModules();

    expect(mockApi.get).toHaveBeenCalledWith('/v1/modules/me', {
      requireOrg: true,
    });
    expect(modules).toEqual([
      { module_id: 'anime', enabled: true },
      { module_id: 'quests', enabled: false },
    ]);
  });

  it('si /v1/modules/me falla retorna []', async () => {
    mockApi.get.mockRejectedValue({ statusCode: 404, message: 'Not found' });

    const userModules = useUserModules();
    const modules = await userModules.fetchUserModules();

    expect(modules).toEqual([]);
  });

  it('sincroniza módulos vía PUT /v1/modules/me', async () => {
    mockApi.put.mockResolvedValue({
      modules: [{ moduleId: 'anime', enabled: true }],
    });

    const userModules = useUserModules();
    const saved = await userModules.saveUserModules([{ module_id: 'anime', enabled: true }]);

    expect(mockApi.put).toHaveBeenCalledWith(
      '/v1/modules/me',
      {
        modules: [{ moduleId: 'anime', enabled: true }],
      },
      {
        requireOrg: true,
      },
    );
    expect(saved).toEqual([{ module_id: 'anime', enabled: true }]);
  });

  it('si guardar módulos falla propaga error', async () => {
    const failure = { statusCode: 501, message: 'Not implemented' };
    mockApi.put.mockRejectedValue(failure);

    const userModules = useUserModules();
    await expect(
      userModules.saveUserModules([{ module_id: 'anime', enabled: true }]),
    ).rejects.toMatchObject(failure);
  });

  it('ante error en fetch no usa fallback legacy', async () => {
    mockApi.get.mockRejectedValue({ statusCode: 404, message: 'Not found' });

    const userModules = useUserModules();
    const modules = await userModules.fetchUserModules();

    expect(modules).toEqual([]);
  });
});
