/**
 * PUT /api/party/lists/:listId — proxies to NestJS PUT /v1/party/lists/:listId.
 *
 * S5.c of the supabase→clerk+nestjs migration.
 */
import { createError, defineEventHandler, getRouterParam, readBody } from 'h3';

import { createApiClient } from '../../../../utils/api-client';

export default defineEventHandler(async (event) => {
  const listId = getRouterParam(event, 'listId');

  if (!listId) {
    throw createError({ statusCode: 400, statusMessage: 'List ID is required' });
  }

  const apiClient = createApiClient(event);
  const body = await readBody(event);

  return apiClient(`/v1/party/lists/${listId}`, {
    method: 'PUT',
    body,
  });
});
