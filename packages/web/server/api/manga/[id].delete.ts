/**
 * DELETE /api/manga/:id — proxies to NestJS DELETE /v1/manga/:id.
 *
 * S5.b of the supabase→clerk+nestjs migration.
 */
import { createError, defineEventHandler, getRouterParam } from 'h3';

import { createApiClient } from '../../utils/api-client';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Manga ID is required' });
  }

  const apiClient = createApiClient(event);

  return apiClient(`/v1/manga/${id}`, {
    method: 'DELETE',
  });
});
