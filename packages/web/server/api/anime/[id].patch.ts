/**
 * PATCH /api/anime/:id — proxies to NestJS PATCH /v1/anime/:id.
 *
 * S5.a of the supabase→clerk+nestjs migration.
 */
import { createError, defineEventHandler, getRouterParam, readBody } from 'h3';

import { createApiClient } from '../../utils/api-client';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Anime ID is required' });
  }

  const apiClient = createApiClient(event);
  const body = await readBody(event);

  return apiClient(`/v1/anime/${id}`, {
    method: 'PATCH',
    body,
  });
});
