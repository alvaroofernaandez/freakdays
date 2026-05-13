/**
 * GET /api/party/:partyId/lists — proxies to NestJS GET /v1/party/:partyId/lists.
 *
 * S5.c of the supabase→clerk+nestjs migration.
 *
 * Auth and party-membership checks live in NestJS.
 */
import { createError, defineEventHandler, getRouterParam } from 'h3';

import { createApiClient } from '../../../../utils/api-client';

export default defineEventHandler(async (event) => {
  const partyId = getRouterParam(event, 'partyId');

  if (!partyId) {
    throw createError({ statusCode: 400, statusMessage: 'Party ID is required' });
  }

  const apiClient = createApiClient(event);

  return apiClient(`/v1/party/${partyId}/lists`);
});
