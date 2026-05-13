import { useAuthStore } from '~~/stores/auth';

export interface MangaEntry {
  id: string;
  title: string;
  author: string | null;
  totalVolumes: number | null;
  ownedVolumes: number[];
  status: 'collecting' | 'completed' | 'dropped' | 'wishlist';
  score: number | null;
  notes: string | null;
  coverUrl: string | null;
  pricePerVolume: number | null;
  totalCost: number | null;
}

export interface CreateMangaDTO {
  title: string;
  author?: string;
  total_volumes?: number;
  status?: 'collecting' | 'completed' | 'dropped' | 'wishlist';
  price_per_volume?: number;
}

interface ApiMangaEntry {
  id: string;
  title: string;
  author: string | null;
  totalVolumes: number | null;
  ownedVolumes: number[];
  status: MangaEntry['status'];
  score: number | null;
  notes: string | null;
  coverUrl: string | null;
  pricePerVolume: number | null;
  totalCost: number | null;
  createdAt: string;
  updatedAt: string;
}

export function useManga() {
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

  async function fetchCollection(): Promise<MangaEntry[]> {
    if (!authStore.userId) return [];

    await refreshAuthContext();

    try {
      const data = await apiClient.get<ApiMangaEntry[]>('/v1/manga', {
        requireOrg: true,
      });
      return data.map(mapApiToManga);
    } catch {
      return [];
    }
  }

  async function addManga(dto: CreateMangaDTO): Promise<MangaEntry | null> {
    if (!authStore.userId) {
      console.error('No user ID available');
      return null;
    }

    if (!dto.title || !dto.title.trim()) {
      console.error('Title is required');
      return null;
    }

    await refreshAuthContext();

    try {
      const data = await apiClient.post<ApiMangaEntry>('/v1/manga', dto, {
        requireOrg: true,
      });
      return mapApiToManga(data);
    } catch (error) {
      console.error('Error in addManga:', error);
      throw apiClient.normalizeApiError(error);
    }
  }

  async function addVolume(id: string, volume: number): Promise<boolean> {
    try {
      const manga = await getMangaById(id);
      if (!manga) return false;

      const volumes = [...manga.ownedVolumes];
      if (!volumes.includes(volume)) {
        volumes.push(volume);
        volumes.sort((a, b) => a - b);
      }

      const pricePerVolume = manga.pricePerVolume ? Number(manga.pricePerVolume) : null;
      const totalCost = pricePerVolume
        ? Math.round(volumes.length * pricePerVolume * 100) / 100
        : manga.totalCost
          ? Number(manga.totalCost)
          : 0;

      const updateData: {
        ownedVolumes: number[];
        totalCost: number;
        status?: string;
      } = {
        ownedVolumes: volumes,
        totalCost,
      };

      if (manga.status === 'wishlist' && volumes.length > 0) {
        updateData.status = 'collecting';
      }

      if (manga.totalVolumes && volumes.length === manga.totalVolumes) {
        updateData.status = 'completed';
      }

      await apiClient.patch<ApiMangaEntry>(`/v1/manga/${id}`, updateData, {
        requireOrg: true,
      });

      return true;
    } catch (error) {
      console.error('Error adding volume:', error);
      return false;
    }
  }

  async function removeVolume(id: string, volume: number): Promise<boolean> {
    try {
      const manga = await getMangaById(id);
      if (!manga) return false;

      const volumes = manga.ownedVolumes.filter((v) => v !== volume);

      const pricePerVolume = manga.pricePerVolume ? Number(manga.pricePerVolume) : null;
      const totalCost = pricePerVolume
        ? Math.round(volumes.length * pricePerVolume * 100) / 100
        : 0;

      const updateData: {
        ownedVolumes: number[];
        totalCost: number;
        status?: string;
      } = {
        ownedVolumes: volumes,
        totalCost,
      };

      if (manga.status === 'completed' && volumes.length < (manga.totalVolumes ?? Infinity)) {
        updateData.status = 'collecting';
      }

      await apiClient.patch<ApiMangaEntry>(`/v1/manga/${id}`, updateData, {
        requireOrg: true,
      });

      return true;
    } catch (error) {
      console.error('Error removing volume:', error);
      return false;
    }
  }

  async function updateScore(id: string, score: number): Promise<boolean> {
    await refreshAuthContext();

    try {
      await apiClient.patch<ApiMangaEntry>(
        `/v1/manga/${id}`,
        { score },
        {
          requireOrg: true,
        },
      );
      return true;
    } catch (error) {
      console.error('Error updating score:', error);
      return false;
    }
  }

  async function updatePricePerVolume(id: string, price: number | null): Promise<boolean> {
    try {
      const manga = await getMangaById(id);
      if (!manga) return false;

      const totalCost =
        price && manga.ownedVolumes.length > 0
          ? Math.round(manga.ownedVolumes.length * price * 100) / 100
          : 0;

      await apiClient.patch<ApiMangaEntry>(
        `/v1/manga/${id}`,
        {
          pricePerVolume: price,
          totalCost,
        },
        {
          requireOrg: true,
        },
      );

      return true;
    } catch (error) {
      console.error('Error updating price:', error);
      return false;
    }
  }

  async function updateStatus(id: string, status: MangaEntry['status']): Promise<boolean> {
    try {
      const manga = await getMangaById(id);
      if (!manga) return false;

      const updateData: {
        status: string;
        ownedVolumes?: number[];
        totalCost?: number;
      } = { status };

      if (status === 'completed' && manga.totalVolumes) {
        const allVolumes = Array.from({ length: manga.totalVolumes }, (_, i) => i + 1);
        const pricePerVolume = manga.pricePerVolume ? Number(manga.pricePerVolume) : null;
        const totalCost = pricePerVolume
          ? Math.round(manga.totalVolumes * pricePerVolume * 100) / 100
          : manga.totalCost
            ? Number(manga.totalCost)
            : 0;

        updateData.ownedVolumes = allVolumes;
        updateData.totalCost = totalCost;
      }

      await apiClient.patch<ApiMangaEntry>(`/v1/manga/${id}`, updateData, {
        requireOrg: true,
      });

      return true;
    } catch (error) {
      console.error('Error updating status:', error);
      return false;
    }
  }

  async function getMangaById(id: string): Promise<MangaEntry | null> {
    try {
      const collection = await fetchCollection();
      return collection.find((m) => m.id === id) || null;
    } catch (error) {
      console.error('Error fetching manga:', error);
      return null;
    }
  }

  async function deleteManga(id: string): Promise<boolean> {
    await refreshAuthContext();

    try {
      await apiClient.del<{ success: true }>(`/v1/manga/${id}`, {
        requireOrg: true,
      });
      return true;
    } catch (error) {
      console.error('Error deleting manga:', error);
      return false;
    }
  }

  function mapApiToManga(row: ApiMangaEntry): MangaEntry {
    return {
      id: row.id,
      title: row.title,
      author: row.author,
      totalVolumes: row.totalVolumes,
      ownedVolumes: row.ownedVolumes,
      status: row.status,
      score: row.score,
      notes: row.notes,
      coverUrl: row.coverUrl,
      pricePerVolume: row.pricePerVolume,
      totalCost: row.totalCost,
    };
  }

  return {
    fetchCollection,
    addManga,
    addVolume,
    removeVolume,
    updateScore,
    updatePricePerVolume,
    updateStatus,
    getMangaById,
    deleteManga,
  };
}
