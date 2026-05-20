import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { IdentityContextService } from '../common/identity/identity-context.service';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  normalizeInteger,
  normalizeOptionalDate,
  normalizeOptionalInteger,
  normalizeOptionalText,
  normalizeTitle,
} from '../common/utils/normalizers';

export type AnimeStatus =
  | 'watching'
  | 'completed'
  | 'on_hold'
  | 'dropped'
  | 'plan_to_watch'
  | 'rewatching';

type NumberInput = number | string | null | undefined;
type DateInput = string | Date | null | undefined;

export interface AnimeView {
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
  createdAt: Date;
  updatedAt: Date;
}

// TODO: Remove snake_case fields (total_episodes, cover_url, current_episode) once
// packages/web migrates useAnimePage.ts and useAnime.ts to camelCase
export interface CreateAnimeInput {
  title: string;
  status?: AnimeStatus;
  totalEpisodes?: NumberInput;
  total_episodes?: NumberInput;
  score?: NumberInput;
  notes?: string | null;
  coverUrl?: string | null;
  cover_url?: string | null;
  currentEpisode?: NumberInput;
  current_episode?: NumberInput;
  startDate?: DateInput;
  endDate?: DateInput;
  rewatchCount?: NumberInput;
}

export interface UpdateAnimeInput {
  status?: AnimeStatus;
  currentEpisode?: NumberInput;
  current_episode?: NumberInput;
  totalEpisodes?: NumberInput;
  total_episodes?: NumberInput;
  score?: NumberInput;
  notes?: string | null;
  coverUrl?: string | null;
  cover_url?: string | null;
  startDate?: DateInput;
  endDate?: DateInput;
  rewatchCount?: NumberInput;
}

@Injectable()
export class AnimeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly identityContext: IdentityContextService,
  ) {}

  async list(
    clerkUserId: string,
    orgId: string | null,
    status?: AnimeStatus,
  ): Promise<AnimeView[]> {
    const { currentUser, organization } = await this.resolveIdentityInOrganization(
      clerkUserId,
      orgId,
    );

    const normalizedStatus =
      status === undefined ? undefined : this.normalizeStatus(status, undefined);

    const entries = await this.prisma.animeEntry.findMany({
      where: {
        userId: currentUser.id,
        organizationId: organization.id,
        ...(normalizedStatus ? { status: normalizedStatus } : {}),
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return entries.map((entry) => this.toAnimeView(entry));
  }

  async create(
    clerkUserId: string,
    orgId: string | null,
    input: CreateAnimeInput,
  ): Promise<AnimeView> {
    const { currentUser, organization } = await this.resolveIdentityInOrganization(
      clerkUserId,
      orgId,
    );

    const title = normalizeTitle(input.title);

    const created = await this.prisma.animeEntry.create({
      data: {
        userId: currentUser.id,
        organizationId: organization.id,
        title,
        status: this.normalizeStatus(input.status, 'plan_to_watch'),
        currentEpisode: normalizeInteger(
          input.currentEpisode ?? input.current_episode,
          'currentEpisode',
          0,
        ),
        totalEpisodes: normalizeOptionalInteger(
          input.totalEpisodes ?? input.total_episodes,
          'totalEpisodes',
        ),
        score: normalizeOptionalInteger(input.score, 'score'),
        notes: normalizeOptionalText(input.notes),
        coverUrl: normalizeOptionalText(input.coverUrl ?? input.cover_url),
        startDate: normalizeOptionalDate(input.startDate, 'startDate'),
        endDate: normalizeOptionalDate(input.endDate, 'endDate'),
        rewatchCount: normalizeInteger(input.rewatchCount, 'rewatchCount', 0),
      },
    });

    return this.toAnimeView(created);
  }

  async update(
    clerkUserId: string,
    orgId: string | null,
    id: string,
    input: UpdateAnimeInput,
  ): Promise<AnimeView> {
    const { currentUser, organization } = await this.resolveIdentityInOrganization(
      clerkUserId,
      orgId,
    );

    const existing = await this.prisma.animeEntry.findFirst({
      where: {
        id,
        userId: currentUser.id,
        organizationId: organization.id,
      },
    });

    if (!existing) {
      throw new NotFoundException('Anime no encontrado');
    }

    const data: Prisma.AnimeEntryUpdateInput = {};

    if (input.status !== undefined) {
      data.status = this.normalizeStatus(input.status, 'plan_to_watch');
    }

    if (input.currentEpisode !== undefined || input.current_episode !== undefined) {
      data.currentEpisode = normalizeInteger(
        input.currentEpisode ?? input.current_episode,
        'currentEpisode',
        existing.currentEpisode,
      );
    }

    if (input.totalEpisodes !== undefined || input.total_episodes !== undefined) {
      data.totalEpisodes = normalizeOptionalInteger(
        input.totalEpisodes ?? input.total_episodes,
        'totalEpisodes',
      );
    }

    if (input.score !== undefined) {
      data.score = normalizeOptionalInteger(input.score, 'score');
    }

    if (input.notes !== undefined) {
      data.notes = normalizeOptionalText(input.notes);
    }

    if (input.coverUrl !== undefined || input.cover_url !== undefined) {
      data.coverUrl = normalizeOptionalText(input.coverUrl ?? input.cover_url);
    }

    if (input.startDate !== undefined) {
      data.startDate = normalizeOptionalDate(input.startDate, 'startDate');
    }

    if (input.endDate !== undefined) {
      data.endDate = normalizeOptionalDate(input.endDate, 'endDate');
    }

    if (input.rewatchCount !== undefined) {
      data.rewatchCount = normalizeInteger(
        input.rewatchCount,
        'rewatchCount',
        existing.rewatchCount,
      );
    }

    const updated =
      Object.keys(data).length === 0
        ? existing
        : await this.prisma.animeEntry.update({
            where: {
              id: existing.id,
            },
            data,
          });

    return this.toAnimeView(updated);
  }

  async remove(clerkUserId: string, orgId: string | null, id: string): Promise<{ success: true }> {
    const { currentUser, organization } = await this.resolveIdentityInOrganization(
      clerkUserId,
      orgId,
    );

    const deleted = await this.prisma.animeEntry.deleteMany({
      where: {
        id,
        userId: currentUser.id,
        organizationId: organization.id,
      },
    });

    if (deleted.count === 0) {
      throw new NotFoundException('Anime no encontrado');
    }

    return { success: true };
  }

  private normalizeStatus(value: string | undefined, fallback: AnimeStatus): AnimeStatus;
  private normalizeStatus(
    value: string | undefined,
    fallback: AnimeStatus | undefined,
  ): AnimeStatus | undefined;
  private normalizeStatus(
    value: string | undefined,
    fallback: AnimeStatus | undefined,
  ): AnimeStatus | undefined {
    const normalized = (value ?? '').trim();

    if (normalized.length === 0) {
      return fallback;
    }

    if (
      normalized === 'watching' ||
      normalized === 'completed' ||
      normalized === 'on_hold' ||
      normalized === 'dropped' ||
      normalized === 'plan_to_watch' ||
      normalized === 'rewatching'
    ) {
      return normalized;
    }

    throw new BadRequestException('Estado de anime inválido');
  }

  private toAnimeView(entry: {
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
    createdAt: Date;
    updatedAt: Date;
  }): AnimeView {
    return {
      id: entry.id,
      title: entry.title,
      status: entry.status,
      currentEpisode: entry.currentEpisode,
      totalEpisodes: entry.totalEpisodes,
      score: entry.score,
      notes: entry.notes,
      coverUrl: entry.coverUrl,
      startDate: entry.startDate,
      endDate: entry.endDate,
      rewatchCount: entry.rewatchCount,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  }

  private assertOrgContext(orgContext: string | null): string {
    if (!orgContext || orgContext.trim().length === 0) {
      throw new BadRequestException(
        'Falta contexto de organización. Enviá x-org-id para continuar.',
      );
    }

    return orgContext.trim();
  }

  private async resolveIdentityInOrganization(
    clerkUserId: string,
    orgId: string | null,
  ): Promise<{
    currentUser: { id: string; clerkUserId: string };
    organization: { id: string; clerkOrgId: string | null };
  }> {
    const orgContext = this.assertOrgContext(orgId);
    const [currentUser, organization] = await Promise.all([
      this.identityContext.getActiveUserByClerkIdOrThrow(clerkUserId),
      this.identityContext.getActiveOrganizationByContextOrThrow(orgContext),
    ]);

    await this.identityContext.assertMembershipOrThrow(currentUser.id, organization.id);

    return {
      currentUser,
      organization,
    };
  }
}
