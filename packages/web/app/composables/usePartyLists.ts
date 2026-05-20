import { ref } from 'vue';
import { devError } from '@/utils/logger';
import type { AnimeStatus } from '~~/domain/types/anime';
import type { PartySharedList, SharedListType } from '~~/domain/types/party';

interface ApiPartyListItem {
  id: string;
  listId: string;
  addedBy: string | null;
  title: string;
  status: string;
  currentEpisode: number;
  totalEpisodes: number | null;
  score: number | null;
  notes: string | null;
  coverUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  rewatchCount: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  addedByUser?: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

interface ApiPartyList {
  id: string;
  partyId: string;
  name: string;
  listType: SharedListType;
  content: unknown;
  createdBy: string;
  createdAt: string;
  creator?: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  _count?: {
    animeItems?: number;
  };
  animeItems?: ApiPartyListItem[];
}

interface PartyListUpdatePayload {
  name?: string;
  content?: unknown;
}

interface PartyListItemPayload {
  title?: string;
  name?: string;
  completed?: boolean;
  status?: string;
  currentEpisode?: number;
  totalEpisodes?: number | null;
  score?: number | null;
  notes?: string | null;
  coverUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  rewatchCount?: number;
}

export function usePartyLists(partyId: string) {
  const lists = ref<PartySharedList[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const apiClient = useApiClient();
  const authContext = useAuthContext();

  async function refreshAuthContext() {
    try {
      await authContext.refresh();
    } catch {
      // no-op
    }
  }

  function mapApiItem(item: ApiPartyListItem) {
    return {
      id: item.id,
      listId: item.listId,
      addedBy: item.addedBy,
      title: item.title,
      status: (item.status as AnimeStatus) || 'plan_to_watch',
      currentEpisode: item.currentEpisode ?? 0,
      totalEpisodes: item.totalEpisodes ?? null,
      score: item.score ?? null,
      notes: item.notes ?? null,
      coverUrl: item.coverUrl ?? null,
      startDate: item.startDate ? new Date(item.startDate) : null,
      endDate: item.endDate ? new Date(item.endDate) : null,
      rewatchCount: item.rewatchCount ?? 0,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
      addedByUser: item.addedByUser,
    };
  }

  function mapApiList(list: ApiPartyList): PartySharedList {
    return {
      id: list.id,
      partyId: list.partyId,
      name: list.name,
      listType: list.listType,
      content: (list.content as PartySharedList['content']) ?? null,
      createdBy: list.createdBy,
      createdAt: new Date(list.createdAt),
      creator: list.creator,
      _count: {
        animeItems: list._count?.animeItems ?? list.animeItems?.length ?? 0,
      },
      animeItems: list.animeItems?.map(mapApiItem),
    };
  }

  async function fetchLists(overridePartyId?: string) {
    loading.value = true;
    error.value = null;

    await refreshAuthContext();

    try {
      const idToUse = overridePartyId || partyId;
      if (!idToUse) {
        throw new Error('Party ID is required');
      }

      const data = await apiClient.get<ApiPartyList[]>(`/v1/party/${idToUse}/lists`, {
        requireOrg: true,
      });

      lists.value = data.map(mapApiList);
    } catch (e: unknown) {
      const err = e as { message?: string; data?: { message?: string } };
      error.value = err.message || err.data?.message || 'Error fetching lists';
      devError('Error fetching party lists:', e);
    } finally {
      loading.value = false;
    }
  }

  async function createList(name: string, type: SharedListType) {
    loading.value = true;
    await refreshAuthContext();

    try {
      const created = await apiClient.post<ApiPartyList>(
        `/v1/party/${partyId}/lists`,
        {
          name,
          listType: type,
        },
        {
          requireOrg: true,
        },
      );

      const newList = mapApiList(created);
      lists.value.unshift(newList);
      return newList;
    } catch (e: unknown) {
      const err = e as { message?: string; data?: { message?: string } };
      error.value = err.message || err.data?.message || 'Error creating list';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchListById(listId: string): Promise<PartySharedList> {
    await refreshAuthContext();
    const list = await apiClient.get<ApiPartyList>(`/v1/party/lists/${listId}`, {
      requireOrg: true,
    });
    return mapApiList(list);
  }

  async function updateList(
    listId: string,
    payload: PartyListUpdatePayload,
  ): Promise<PartySharedList> {
    await refreshAuthContext();
    const updated = await apiClient.put<ApiPartyList>(`/v1/party/lists/${listId}`, payload, {
      requireOrg: true,
    });
    return mapApiList(updated);
  }

  async function addListItem(listId: string, payload: PartyListItemPayload) {
    await refreshAuthContext();
    const created = await apiClient.post<ApiPartyListItem>(
      `/v1/party/lists/${listId}/items`,
      payload,
      { requireOrg: true },
    );
    return mapApiItem(created);
  }

  async function deleteListItem(listId: string, itemId: string): Promise<void> {
    await refreshAuthContext();
    await apiClient.del<{ success: true }>(`/v1/party/lists/${listId}/items/${itemId}`, {
      requireOrg: true,
    });
  }

  return {
    lists,
    loading,
    error,
    fetchLists,
    createList,
    fetchListById,
    updateList,
    addListItem,
    deleteListItem,
  };
}
