/**
 * GET /api/workouts — proxies to NestJS GET /v1/workouts.
 *
 * S5.f of the supabase→clerk+nestjs migration.
 */
import { defineEventHandler, getQuery } from 'h3';

import { createApiClient } from '../../utils/api-client';

export default defineEventHandler(async (event) => {
  const apiClient = createApiClient(event);
  const query = getQuery(event);

  return apiClient('/v1/workouts', {
    query: Object.keys(query).length > 0 ? query : undefined,
  });
});
