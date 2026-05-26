import { computeLevel, expForNextLevel as domainExpForNextLevel } from '@freakdays/domain';
import { AppError } from '@/utils/error-handling';
import { useAuthStore } from '~~/stores/auth';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  totalExp: number;
  level: number;
  bio: string | null;
  favoriteAnimeId: string | null;
  favoriteMangaId: string | null;
  location: string | null;
  website: string | null;
  socialLinks: Record<string, string>;
  leaderboardOptIn?: boolean;
}

interface SignedUploadUrlResponse {
  uploadUrl: string;
  key: string;
  publicUrl: string;
  expiresIn: number;
}

interface ConfirmAvatarResponse {
  avatarUrl: string;
  avatarKey: string;
}

interface ConfirmBannerResponse {
  bannerUrl: string;
  bannerKey: string;
}

interface AddExpResponse {
  newTotal: number;
  newLevel: number;
}

export function useProfile() {
  const authStore = useAuthStore();
  const apiClient = useApiClient();
  const authContext = useAuthContext();

  async function refreshAuthContext() {
    try {
      await authContext.refresh();
    } catch {
      // no-op: dejamos que el request falle normalizado
    }
  }

  function hasAuthContext(): boolean {
    return !!authStore.userId || !!authContext.getAccessToken();
  }

  async function uploadViaSignedUrl(signedUrl: string, file: File, contentType?: string) {
    const response = await fetch(signedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType || file.type || 'application/octet-stream',
      },
      body: file,
    });

    if (!response.ok) {
      throw new AppError(
        'Falló la subida del archivo al storage firmado',
        'SIGNED_UPLOAD_FAILED',
        response.status,
      );
    }
  }

  function mapApiToProfile(row: {
    id: string;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    bannerUrl: string | null;
    totalExp: number;
    level: number;
    bio: string | null;
    favoriteAnimeId: string | null;
    favoriteMangaId: string | null;
    location: string | null;
    website: string | null;
    socialLinks: unknown;
  }): UserProfile {
    return {
      id: row.id,
      username: row.username ?? '',
      displayName: row.displayName,
      avatarUrl: row.avatarUrl,
      bannerUrl: row.bannerUrl,
      totalExp: row.totalExp,
      level: row.level,
      bio: row.bio,
      favoriteAnimeId: row.favoriteAnimeId,
      favoriteMangaId: row.favoriteMangaId,
      location: row.location,
      website: row.website,
      socialLinks: (row.socialLinks as Record<string, string>) ?? {},
    };
  }

  async function fetchProfile(): Promise<UserProfile | null> {
    await refreshAuthContext();

    if (!hasAuthContext()) return null;

    try {
      const data = await apiClient.get<UserProfile>('/v1/profile/me');
      return mapApiToProfile(data);
    } catch {
      return null;
    }
  }

  async function updateProfile(updates: {
    username?: string;
    display_name?: string | null;
    avatar_url?: string | null;
    banner_url?: string | null;
    bio?: string | null;
    favorite_anime_id?: string | null;
    favorite_manga_id?: string | null;
    location?: string | null;
    website?: string | null;
    social_links?: Record<string, string>;
  }): Promise<boolean> {
    await refreshAuthContext();

    if (!hasAuthContext()) return false;

    try {
      await apiClient.put<UserProfile>('/v1/profile/me', updates);
      return true;
    } catch {
      return false;
    }
  }

  async function uploadAvatar(file: File): Promise<string | null> {
    await refreshAuthContext();

    if (!hasAuthContext()) return null;

    try {
      const signed = await apiClient.post<SignedUploadUrlResponse>(
        '/v1/profile/me/avatar/upload-url',
        {
          contentType: file.type || 'application/octet-stream',
          fileName: file.name,
        },
      );

      await uploadViaSignedUrl(signed.uploadUrl, file, file.type);

      const confirmed = await apiClient.post<ConfirmAvatarResponse>(
        '/v1/profile/me/avatar/confirm',
        {
          key: signed.key,
        },
      );

      return confirmed.avatarUrl || signed.publicUrl;
    } catch {
      return null;
    }
  }

  async function deleteAvatar(): Promise<boolean> {
    await refreshAuthContext();

    if (!hasAuthContext()) return false;

    try {
      await apiClient.del<{ success: true }>('/v1/profile/me/avatar');
      return true;
    } catch {
      return false;
    }
  }

  async function uploadBanner(file: File): Promise<string | null> {
    await refreshAuthContext();

    if (!hasAuthContext()) return null;

    try {
      const signed = await apiClient.post<SignedUploadUrlResponse>(
        '/v1/profile/me/banner/upload-url',
        {
          contentType: file.type || 'application/octet-stream',
          fileName: file.name,
        },
      );

      await uploadViaSignedUrl(signed.uploadUrl, file, file.type);

      const confirmed = await apiClient.post<ConfirmBannerResponse>(
        '/v1/profile/me/banner/confirm',
        {
          key: signed.key,
        },
      );

      return confirmed.bannerUrl || signed.publicUrl;
    } catch {
      return null;
    }
  }

  async function deleteBanner(): Promise<boolean> {
    await refreshAuthContext();

    if (!hasAuthContext()) return false;

    try {
      await apiClient.del<{ success: true }>('/v1/profile/me/banner');
      return true;
    } catch {
      return false;
    }
  }

  async function addExp(amount: number): Promise<{ newTotal: number; newLevel: number } | null> {
    await refreshAuthContext();

    if (!hasAuthContext()) return null;

    try {
      const result = await apiClient.post<AddExpResponse>('/v1/profile/me/exp', {
        amount,
      });
      return result as { newTotal: number; newLevel: number };
    } catch {
      return null;
    }
  }

  function calculateLevel(exp: number): number {
    return computeLevel(exp);
  }

  function expForNextLevel(currentExp: number): {
    current: number;
    needed: number;
    progress: number;
  } {
    return domainExpForNextLevel(currentExp);
  }

  return {
    fetchProfile,
    updateProfile,
    addExp,
    calculateLevel,
    expForNextLevel,
    uploadAvatar,
    deleteAvatar,
    uploadBanner,
    deleteBanner,
  };
}
