/**
 * POST /api/anime — proxies to NestJS POST /v1/anime.
 *
 * S5.a of the supabase→clerk+nestjs migration.
 *
 * The user is identified by the Clerk JWT; `userId` in the body is ignored
 * by NestJS but forwarded transparently for backward compatibility.
 */
import { defineEventHandler, readBody } from 'h3';

import { createApiClient } from '../../utils/api-client';

export default defineEventHandler(async (event) => {
  const apiClient = createApiClient(event);
  const body = await readBody(event);

  return apiClient('/v1/anime', {
    method: 'POST',
    body,
  });
});
