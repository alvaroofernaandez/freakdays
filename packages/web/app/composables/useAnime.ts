import { devError } from '@/utils/logger';
import { useAuthStore } from '~~/stores/auth';

export type AnimeStatus =
  | 'watching'
  | 'completed'
  | 'on_hold'
  | 'dropped'
  | 'plan_to_watch'
  | 'rewatching';

export interface AnimeEntry {
  id: string;
  title: string;
  status: AnimeStatus;
  currentEpisode: number;
  totalEpisodes: number | null;
  score: number | null;
  notes: string | null;
  coverUrl: string | null;
  startDate: Date | null;
  endDate: Date | null;
  rewatchCount: number;
}

export interface CreateAnimeDTO {
  title: string;
  status: AnimeStatus;
  total_episodes?: number;
  score?: number;
  cover_url?: string;
  notes?: string;
}

interface ApiAnimeEntry {
  id: string;
  title: string;
  status: AnimeStatus;
  currentEpisode: number;
  totalEpisodes: number | null;
  score: number | null;
  notes: string | null;
  coverUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  rewatchCount: number;
  createdAt: string;
  updatedAt: string;
}

export function useAnime() {
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

  async function fetchAnimeList(): Promise<AnimeEntry[]> {
    if (!authStore.userId) return [];

    await refreshAuthContext();

    try {
      const data = await apiClient.get<ApiAnimeEntry[]>('/v1/anime', {
        requireOrg: true,
      });
      return data.map(mapApiToAnime);
    } catch {
      return [];
    }
  }

  async function fetchByStatus(status: AnimeStatus): Promise<AnimeEntry[]> {
    if (!authStore.userId) return [];

    await refreshAuthContext();

    try {
      const data = await apiClient.get<ApiAnimeEntry[]>(
        `/v1/anime?status=${encodeURIComponent(status)}`,
        { requireOrg: true },
      );
      return data.map(mapApiToAnime);
    } catch {
      return [];
    }
  }

  async function addAnime(dto: CreateAnimeDTO): Promise<AnimeEntry | null> {
    if (!authStore.userId) {
      devError('No user ID available');
      return null;
    }

    if (!dto.title || !dto.title.trim()) {
      devError('Title is required');
      return null;
    }

    await refreshAuthContext();

    try {
      const data = await apiClient.post<ApiAnimeEntry>('/v1/anime', dto, {
        requireOrg: true,
      });
      return mapApiToAnime(data);
    } catch (error) {
      devError('Error in addAnime:', error);
      throw apiClient.normalizeApiError(error);
    }
  }

  async function updateProgress(id: string, episode: number): Promise<boolean> {
    await refreshAuthContext();

    try {
      await apiClient.patch<ApiAnimeEntry>(
        `/v1/anime/${id}`,
        { currentEpisode: episode },
        {
          requireOrg: true,
        },
      );
      return true;
    } catch {
      return false;
    }
  }

  async function updateStatus(id: string, status: AnimeStatus): Promise<boolean> {
    await refreshAuthContext();

    try {
      const updates: {
        status: string;
        endDate?: string;
        startDate?: string;
      } = { status };

      if (status === 'completed') {
        updates.endDate = new Date().toISOString();
      } else if (status === 'watching') {
        updates.startDate = new Date().toISOString();
      }

      await apiClient.patch<ApiAnimeEntry>(`/v1/anime/${id}`, updates, {
        requireOrg: true,
      });
      return true;
    } catch {
      return false;
    }
  }

  async function updateScore(id: string, score: number): Promise<boolean> {
    await refreshAuthContext();

    try {
      await apiClient.patch<ApiAnimeEntry>(
        `/v1/anime/${id}`,
        { score },
        {
          requireOrg: true,
        },
      );
      return true;
    } catch {
      return false;
    }
  }

  async function deleteAnime(id: string): Promise<boolean> {
    await refreshAuthContext();

    try {
      await apiClient.del<{ success: true }>(`/v1/anime/${id}`, {
        requireOrg: true,
      });
      return true;
    } catch {
      return false;
    }
  }

  function mapApiToAnime(row: ApiAnimeEntry): AnimeEntry {
    return {
      id: row.id,
      title: row.title,
      status: row.status,
      currentEpisode: row.currentEpisode,
      totalEpisodes: row.totalEpisodes,
      score: row.score,
      notes: row.notes,
      coverUrl: row.coverUrl,
      startDate: row.startDate ? new Date(row.startDate) : null,
      endDate: row.endDate ? new Date(row.endDate) : null,
      rewatchCount: row.rewatchCount,
    };
  }

  return {
    fetchAnimeList,
    fetchByStatus,
    addAnime,
    updateProgress,
    updateStatus,
    updateScore,
    deleteAnime,
  };
}
