/**
 * GET /api/manga — proxies to NestJS GET /v1/manga.
 *
 * S5.b of the supabase→clerk+nestjs migration.
 *
 * NestJS scopes by the Clerk JWT subject; `userId` query param is ignored
 * but tolerated for backward compatibility.
 */
import { defineEventHandler, getQuery } from 'h3';

import { createApiClient } from '../../utils/api-client';

export default defineEventHandler(async (event) => {
  const apiClient = createApiClient(event);
  const query = getQuery(event);

  return apiClient('/v1/manga', {
    query: query.status ? { status: query.status } : undefined,
  });
});
