import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, Profile } from '@prisma/client';
import { computeLevel } from '@freakdays/domain';

import {
  type ActiveIdentityUser,
  IdentityContextService,
} from '../common/identity/identity-context.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { EventBusService } from '../events/event-bus.service';
import { EVENT_TYPES } from '../events/event-types';
import { normalizeUrl } from '../common/utils/normalizers';
import { StorageService } from '../storage/storage.service';

export interface ProfileView {
  id: string;
  userId: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  avatarKey: string | null;
  bannerUrl: string | null;
  bannerKey: string | null;
  totalExp: number;
  level: number;
  bio: string | null;
  favoriteAnimeId: string | null;
  favoriteMangaId: string | null;
  location: string | null;
  website: string | null;
  socialLinks: Record<string, string>;
  leaderboardOptIn: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileInput {
  username?: string;
  displayName?: string | null;
  display_name?: string | null;
  bio?: string | null;
  favoriteAnimeId?: string | null;
  favorite_anime_id?: string | null;
  favoriteMangaId?: string | null;
  favorite_manga_id?: string | null;
  location?: string | null;
  website?: string | null;
  socialLinks?: Record<string, string>;
  social_links?: Record<string, string>;
  leaderboardOptIn?: boolean;
}

export interface AddProfileExpInput {
  amount: number;
}

export interface RequestUploadUrlInput {
  contentType?: string;
  fileName?: string;
}

export interface ConfirmProfileMediaInput {
  key: string;
}

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly identityContext: IdentityContextService,
    private readonly eventBus: EventBusService,
  ) {}

  async getMyProfile(clerkUserId: string): Promise<ProfileView> {
    const { user, profile } = await this.ensureProfileForCurrentUser(clerkUserId);
    // Touch daily login on every profile fetch — at-most-once per day guard inside
    await this.touchDailyLogin(profile.userId, null).catch(() => {
      // Non-critical — best effort; don't fail the request
    });
    return this.toProfileView(profile, user.clerkUserId);
  }

  /**
   * Emits a DAILY_LOGIN event at most once per calendar day per user.
   * Returns true if the event was emitted, false if already done today.
   */
  async touchDailyLogin(userId: string, orgId: string | null): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0] as string;

    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true, lastLoginDate: true },
    });

    if (!profile) {
      return false;
    }

    if (profile.lastLoginDate === today) {
      return false;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.profile.update({
        where: { id: profile.id },
        data: { lastLoginDate: today },
      });

      const event = this.eventBus.buildEvent(
        EVENT_TYPES.DAILY_LOGIN,
        userId,
        { userId, orgId: orgId ?? '', loginDate: today },
        orgId ?? undefined,
      );

      await this.eventBus.emit(tx as unknown as Prisma.TransactionClient, event);
    });

    return true;
  }

  async updateMyProfile(clerkUserId: string, input: UpdateProfileInput): Promise<ProfileView> {
    const { user, profile } = await this.ensureProfileForCurrentUser(clerkUserId);
    const updateData = this.buildProfileUpdateData(input);

    const updated = await this.prisma.profile.update({
      where: { id: profile.id },
      data: updateData,
    });

    return this.toProfileView(updated, user.clerkUserId);
  }

  async addExp(
    clerkUserId: string,
    input: AddProfileExpInput,
  ): Promise<{ newTotal: number; newLevel: number }> {
    if (typeof input.amount !== 'number' || !Number.isFinite(input.amount)) {
      throw new BadRequestException('El amount de exp debe ser un número válido');
    }

    if (input.amount <= 0) {
      throw new BadRequestException('El amount de exp debe ser mayor a cero');
    }

    const MAX_EXP_PER_REQUEST = 1000;

    if (input.amount > MAX_EXP_PER_REQUEST) {
      throw new BadRequestException(
        `El amount de exp no puede superar ${MAX_EXP_PER_REQUEST} por request`,
      );
    }

    const { profile } = await this.ensureProfileForCurrentUser(clerkUserId);
    const newTotal = profile.totalExp + Math.floor(input.amount);
    const newLevel = computeLevel(newTotal);

    await this.prisma.profile.update({
      where: { id: profile.id },
      data: {
        totalExp: newTotal,
        level: newLevel,
      },
    });

    return {
      newTotal,
      newLevel,
    };
  }

  async requestAvatarUploadUrl(
    clerkUserId: string,
    input: RequestUploadUrlInput,
  ): Promise<{ uploadUrl: string; key: string; publicUrl: string; expiresIn: number }> {
    this.assertImagePayload(input);

    return this.storageService.createSignedPutUrl({
      clerkUserId,
      folder: 'avatars',
      contentType: input.contentType,
      fileName: input.fileName,
    });
  }

  async requestBannerUploadUrl(
    clerkUserId: string,
    input: RequestUploadUrlInput,
  ): Promise<{ uploadUrl: string; key: string; publicUrl: string; expiresIn: number }> {
    this.assertImagePayload(input);

    return this.storageService.createSignedPutUrl({
      clerkUserId,
      folder: 'banners',
      contentType: input.contentType,
      fileName: input.fileName,
    });
  }

  async confirmAvatarUpload(
    clerkUserId: string,
    input: ConfirmProfileMediaInput,
  ): Promise<{ avatarUrl: string; avatarKey: string }> {
    this.assertValidMediaKey(input.key, clerkUserId, 'avatars');

    const { profile } = await this.ensureProfileForCurrentUser(clerkUserId);
    const avatarUrl = this.storageService.getPublicUrlForKey(input.key);

    await this.prisma.profile.update({
      where: { id: profile.id },
      data: {
        avatarKey: input.key,
        avatarUrl,
      },
    });

    return {
      avatarUrl,
      avatarKey: input.key,
    };
  }

  async confirmBannerUpload(
    clerkUserId: string,
    input: ConfirmProfileMediaInput,
  ): Promise<{ bannerUrl: string; bannerKey: string }> {
    this.assertValidMediaKey(input.key, clerkUserId, 'banners');

    const { profile } = await this.ensureProfileForCurrentUser(clerkUserId);
    const bannerUrl = this.storageService.getPublicUrlForKey(input.key);

    await this.prisma.profile.update({
      where: { id: profile.id },
      data: {
        bannerKey: input.key,
        bannerUrl,
      },
    });

    return {
      bannerUrl,
      bannerKey: input.key,
    };
  }

  async deleteAvatar(clerkUserId: string): Promise<{ success: true }> {
    const { profile } = await this.ensureProfileForCurrentUser(clerkUserId);

    await this.prisma.profile.update({
      where: { id: profile.id },
      data: {
        avatarUrl: null,
        avatarKey: null,
      },
    });

    return { success: true };
  }

  async deleteBanner(clerkUserId: string): Promise<{ success: true }> {
    const { profile } = await this.ensureProfileForCurrentUser(clerkUserId);

    await this.prisma.profile.update({
      where: { id: profile.id },
      data: {
        bannerUrl: null,
        bannerKey: null,
      },
    });

    return { success: true };
  }

  private async ensureProfileForCurrentUser(clerkUserId: string) {
    const user = await this.identityContext.getActiveUserByClerkIdOrThrow(clerkUserId);
    const profile = await this.ensureProfile(user);

    return { user, profile };
  }

  private async ensureProfile(user: ActiveIdentityUser): Promise<Profile> {
    const existing = await this.prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.profile.create({
      data: {
        userId: user.id,
        username: this.buildDefaultUsername(user.clerkUserId),
        level: 1,
        totalExp: 0,
        socialLinks: {},
      },
    });
  }

  private buildDefaultUsername(clerkUserId: string): string {
    const normalized = clerkUserId.toLowerCase().replace(/[^a-z0-9_-]/g, '');

    if (normalized.length === 0) {
      return `user_${Date.now()}`;
    }

    return normalized.slice(0, 24);
  }

  private buildProfileUpdateData(input: UpdateProfileInput): Prisma.ProfileUpdateInput {
    const socialLinks = input.social_links ?? input.socialLinks;

    const updateData: Prisma.ProfileUpdateInput = {};

    if (Object.prototype.hasOwnProperty.call(input, 'username')) {
      if (typeof input.username !== 'string') {
        throw new BadRequestException('username debe ser string');
      }

      const username = input.username.trim();

      if (username.length === 0) {
        throw new BadRequestException('username no puede estar vacío');
      }

      updateData.username = username;
    }

    if (Object.prototype.hasOwnProperty.call(input, 'display_name')) {
      updateData.displayName = this.normalizeNullableString(input.display_name);
    } else if (Object.prototype.hasOwnProperty.call(input, 'displayName')) {
      updateData.displayName = this.normalizeNullableString(input.displayName);
    }

    if (Object.prototype.hasOwnProperty.call(input, 'bio')) {
      updateData.bio = this.normalizeNullableString(input.bio);
    }

    if (Object.prototype.hasOwnProperty.call(input, 'favorite_anime_id')) {
      updateData.favoriteAnimeId = this.normalizeNullableString(input.favorite_anime_id);
    } else if (Object.prototype.hasOwnProperty.call(input, 'favoriteAnimeId')) {
      updateData.favoriteAnimeId = this.normalizeNullableString(input.favoriteAnimeId);
    }

    if (Object.prototype.hasOwnProperty.call(input, 'favorite_manga_id')) {
      updateData.favoriteMangaId = this.normalizeNullableString(input.favorite_manga_id);
    } else if (Object.prototype.hasOwnProperty.call(input, 'favoriteMangaId')) {
      updateData.favoriteMangaId = this.normalizeNullableString(input.favoriteMangaId);
    }

    if (Object.prototype.hasOwnProperty.call(input, 'location')) {
      updateData.location = this.normalizeNullableString(input.location);
    }

    if (Object.prototype.hasOwnProperty.call(input, 'website')) {
      const raw = this.normalizeNullableString(input.website);
      updateData.website = raw !== null ? normalizeUrl(raw, 'website') : null;
    }

    if (Object.prototype.hasOwnProperty.call(input, 'leaderboardOptIn')) {
      if (typeof input.leaderboardOptIn !== 'boolean') {
        throw new BadRequestException('leaderboardOptIn debe ser boolean');
      }

      updateData.leaderboardOptIn = input.leaderboardOptIn;
    }

    if (socialLinks !== undefined) {
      if (typeof socialLinks !== 'object' || socialLinks === null || Array.isArray(socialLinks)) {
        throw new BadRequestException('social_links debe ser un objeto { [key]: string }');
      }

      const normalizedSocialLinks: Record<string, string> = {};

      for (const [key, value] of Object.entries(socialLinks)) {
        if (typeof value !== 'string') {
          throw new BadRequestException('social_links solo permite valores string');
        }

        const normalizedKey = key.trim();
        const normalizedValue = value.trim();

        if (normalizedKey.length > 0 && normalizedValue.length > 0) {
          normalizedSocialLinks[normalizedKey] = normalizeUrl(
            normalizedValue,
            `socialLinks.${normalizedKey}`,
          );
        }
      }

      updateData.socialLinks = normalizedSocialLinks;
    }

    return updateData;
  }

  private normalizeNullableString(value: unknown): string | null {
    if (value === null) {
      return null;
    }

    if (value === undefined) {
      return null;
    }

    if (typeof value !== 'string') {
      throw new BadRequestException('Valor inválido: se esperaba string o null');
    }

    const normalized = value.trim();

    return normalized.length > 0 ? normalized : null;
  }

  private toProfileView(profile: Profile, clerkUserId: string): ProfileView {
    return {
      id: profile.id,
      userId: clerkUserId,
      username: profile.username,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      avatarKey: profile.avatarKey,
      bannerUrl: profile.bannerUrl,
      bannerKey: profile.bannerKey,
      totalExp: profile.totalExp,
      level: profile.level,
      bio: profile.bio,
      favoriteAnimeId: profile.favoriteAnimeId,
      favoriteMangaId: profile.favoriteMangaId,
      location: profile.location,
      website: profile.website,
      socialLinks: this.normalizeSocialLinks(profile.socialLinks),
      leaderboardOptIn: profile.leaderboardOptIn,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  private normalizeSocialLinks(value: Prisma.JsonValue): Record<string, string> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }

    const result: Record<string, string> = {};

    for (const [key, rawValue] of Object.entries(value as Record<string, unknown>)) {
      if (typeof rawValue === 'string') {
        result[key] = rawValue;
      }
    }

    return result;
  }

  private assertImagePayload(input: RequestUploadUrlInput): void {
    if (!input || typeof input !== 'object') {
      throw new BadRequestException('Payload inválido para solicitar signed URL');
    }

    if (input.contentType !== undefined) {
      if (typeof input.contentType !== 'string' || !input.contentType.startsWith('image/')) {
        throw new BadRequestException('contentType debe ser una imagen válida (image/*)');
      }
    }

    if (input.fileName !== undefined && typeof input.fileName !== 'string') {
      throw new BadRequestException('fileName debe ser string');
    }
  }

  private assertValidMediaKey(
    key: string,
    clerkUserId: string,
    folder: 'avatars' | 'banners',
  ): void {
    if (typeof key !== 'string' || key.trim().length === 0) {
      throw new BadRequestException('key de media inválida');
    }

    const safeClerkUserId = clerkUserId.replace(/[^a-zA-Z0-9_-]/g, '');
    const expectedPrefix = `profiles/${safeClerkUserId}/${folder}/`;

    if (!key.startsWith(expectedPrefix)) {
      throw new NotFoundException('La key no pertenece al usuario autenticado');
    }
  }
}
