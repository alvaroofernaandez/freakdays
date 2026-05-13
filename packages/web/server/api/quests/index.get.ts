/**
 * GET /api/quests — proxies to NestJS GET /v1/quests.
 *
 * S5.e of the supabase→clerk+nestjs migration.
 */
import { defineEventHandler, getQuery } from 'h3';

import { createApiClient } from '../../utils/api-client';

export default defineEventHandler(async (event) => {
  const apiClient = createApiClient(event);
  const query = getQuery(event);

  return apiClient('/v1/quests', {
    query: query.status ? { status: query.status } : undefined,
  });
});
