/**
 * GET /api/anime — proxies to NestJS GET /v1/anime.
 *
 * S5.a of the supabase→clerk+nestjs migration.
 *
 * The `userId` query param is no longer required: NestJS scopes the list to
 * the authenticated user via the Clerk JWT. The proxy forwards `status` if
 * present and ignores `userId` (still tolerated for backward compatibility
 * during the migration window).
 */
import { defineEventHandler, getQuery } from 'h3';

import { createApiClient } from '../../utils/api-client';

export default defineEventHandler(async (event) => {
  const apiClient = createApiClient(event);
  const query = getQuery(event);

  return apiClient('/v1/anime', {
    query: query.status ? { status: query.status } : undefined,
  });
});
