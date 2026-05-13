import { useAuthStore } from '~~/stores/auth';

export type ReleaseType = 'anime_episode' | 'manga_volume' | 'event';

export interface Release {
  id: string;
  title: string;
  type: ReleaseType;
  releaseDate: Date;
  description: string | null;
  url: string | null;
  createdAt: Date;
}

export interface CreateReleaseDTO {
  title: string;
  type: ReleaseType;
  release_date: string;
  description?: string;
  url?: string;
}

interface ApiRelease {
  id: string;
  title: string;
  type: ReleaseType;
  releaseDate: string;
  description: string | null;
  url: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useCalendar() {
  const authStore = useAuthStore();
  const apiClient = useApiClient();
  const authContext = useAuthContext();

  async function refreshAuthContext() {
    try {
      await authContext.refresh();
    } catch {
      // no-op
    }
  }

  async function fetchReleases(): Promise<Release[]> {
    if (!authStore.userId) return [];

    await refreshAuthContext();

    try {
      const releases = await apiClient.get<ApiRelease[]>('/v1/calendar/releases', {
        requireOrg: true,
      });

      return releases.map(mapApiToRelease);
    } catch (error) {
      throw apiClient.normalizeApiError(error);
    }
  }

  async function fetchUpcoming(daysAhead = 30): Promise<Release[]> {
    if (!authStore.userId) return [];

    await refreshAuthContext();

    try {
      const upcoming = await apiClient.get<ApiRelease[]>(
        `/v1/calendar/releases/upcoming?daysAhead=${daysAhead}`,
        {
          requireOrg: true,
        },
      );

      return upcoming.map(mapApiToRelease);
    } catch (error) {
      throw apiClient.normalizeApiError(error);
    }
  }

  async function addRelease(dto: CreateReleaseDTO): Promise<Release | null> {
    if (!authStore.userId) return null;

    await refreshAuthContext();

    try {
      const created = await apiClient.post<ApiRelease>(
        '/v1/calendar/releases',
        {
          title: dto.title,
          type: dto.type,
          releaseDate: dto.release_date,
          description: dto.description,
          url: dto.url,
        },
        {
          requireOrg: true,
        },
      );

      return mapApiToRelease(created);
    } catch (error) {
      throw apiClient.normalizeApiError(error);
    }
  }

  async function updateRelease(
    id: string,
    dto: Partial<CreateReleaseDTO>,
  ): Promise<Release | null> {
    if (!authStore.userId) return null;

    await refreshAuthContext();

    const payload: Record<string, unknown> = {};
    if (dto.title !== undefined) payload.title = dto.title;
    if (dto.type !== undefined) payload.type = dto.type;
    if (dto.release_date !== undefined) payload.releaseDate = dto.release_date;
    if (dto.description !== undefined) payload.description = dto.description;
    if (dto.url !== undefined) payload.url = dto.url;

    try {
      const updated = await apiClient.put<ApiRelease>(`/v1/calendar/releases/${id}`, payload, {
        requireOrg: true,
      });

      return mapApiToRelease(updated);
    } catch (error) {
      throw apiClient.normalizeApiError(error);
    }
  }

  async function deleteRelease(id: string): Promise<boolean> {
    if (!authStore.userId) return false;

    await refreshAuthContext();

    try {
      await apiClient.del<{ success: true }>(`/v1/calendar/releases/${id}`, {
        requireOrg: true,
      });

      return true;
    } catch (error) {
      throw apiClient.normalizeApiError(error);
    }
  }

  function mapApiToRelease(row: ApiRelease): Release {
    const date = new Date(row.releaseDate);

    return {
      id: row.id,
      title: row.title,
      type: row.type,
      releaseDate: date,
      description: row.description,
      url: row.url,
      createdAt: new Date(row.createdAt),
    };
  }

  return {
    fetchReleases,
    fetchUpcoming,
    addRelease,
    updateRelease,
    deleteRelease,
  };
}
