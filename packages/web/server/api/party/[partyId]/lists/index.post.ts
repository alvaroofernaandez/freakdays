/**
 * POST /api/party/:partyId/lists — proxies to NestJS POST /v1/party/:partyId/lists.
 *
 * S5.c of the supabase→clerk+nestjs migration.
 */
import { createError, defineEventHandler, getRouterParam, readBody } from 'h3';

import { createApiClient } from '../../../../utils/api-client';

export default defineEventHandler(async (event) => {
  const partyId = getRouterParam(event, 'partyId');

  if (!partyId) {
    throw createError({ statusCode: 400, statusMessage: 'Party ID is required' });
  }

  const apiClient = createApiClient(event);
  const body = await readBody(event);

  return apiClient(`/v1/party/${partyId}/lists`, {
    method: 'POST',
    body,
  });
});
