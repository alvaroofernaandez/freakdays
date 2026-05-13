import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

import { usePartyLists } from '../../../app/composables/usePartyLists';
import { useAuthStore } from '../../../stores/auth';

const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
  normalizeApiError: vi.fn((error: unknown) => {
    if (typeof error === 'object' && error !== null) {
      return error as { statusCode?: number; message: string; code?: string };
    }

    return {
      message: 'unknown',
    };
  }),
};

const mockFetch = vi.fn();

vi.mock('../../../app/composables/useApiClient', () => ({
  useApiClient: () => mockApi,
}));

vi.mock('../../../app/composables/useAuthContext', () => ({
  useAuthContext: () => ({
    refresh: vi.fn().mockResolvedValue(undefined),
  }),
}));

describe('usePartyLists', () => {
  beforeAll(() => {
    vi.stubGlobal('$fetch', mockFetch);
  });

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    const authStore = useAuthStore();
    authStore.setSession({ user: { id: 'user-1' } } as never);
  });

  it('lista party-lists vía /v1/party/:partyId/lists', async () => {
    mockApi.get.mockResolvedValue([
      {
        id: 'list-1',
        partyId: 'party-1',
        name: 'Tier de openings',
        listType: 'tier_list',
        content: null,
        createdBy: 'clerk_1',
        createdAt: '2026-03-27T00:00:00.000Z',
        _count: { animeItems: 0 },
      },
    ]);

    const partyLists = usePartyLists('party-1');
    await partyLists.fetchLists();

    expect(mockApi.get).toHaveBeenCalledWith('/v1/party/party-1/lists', {
      requireOrg: true,
    });
    expect(partyLists.lists.value).toHaveLength(1);
    expect(partyLists.lists.value[0]?.createdAt).toBeInstanceOf(Date);
  });

  it('crea lista vía API-first', async () => {
    mockApi.post.mockResolvedValue({
      id: 'list-2',
      partyId: 'party-1',
      name: 'Anime Summer',
      listType: 'anime',
      content: null,
      createdBy: 'clerk_1',
      createdAt: '2026-03-27T00:00:00.000Z',
      _count: { animeItems: 0 },
    });

    const partyLists = usePartyLists('party-1');
    const created = await partyLists.createList('Anime Summer', 'anime');

    expect(mockApi.post).toHaveBeenCalledWith(
      '/v1/party/party-1/lists',
      { name: 'Anime Summer', listType: 'anime' },
      { requireOrg: true },
    );
    expect(created?.name).toBe('Anime Summer');
  });

  it('cuando falla API-first setea error y no usa /api legacy', async () => {
    mockApi.get.mockRejectedValue({ statusCode: 404, message: 'Not found' });

    const partyLists = usePartyLists('party-1');
    await partyLists.fetchLists();

    expect(mockFetch).not.toHaveBeenCalled();
    expect(partyLists.error.value).toContain('Not found');
  });
});
