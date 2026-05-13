/**
 * PATCH /api/quests/:id — proxies to NestJS PATCH /v1/quests/:id.
 *
 * S5.e of the supabase→clerk+nestjs migration.
 */
import { createError, defineEventHandler, getRouterParam, readBody } from 'h3';

import { createApiClient } from '../../utils/api-client';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Quest ID is required' });
  }

  const apiClient = createApiClient(event);
  const body = await readBody(event);

  return apiClient(`/v1/quests/${id}`, {
    method: 'PATCH',
    body,
  });
});
