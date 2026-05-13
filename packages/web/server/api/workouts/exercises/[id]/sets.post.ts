/**
 * POST /api/workouts/exercises/:id/sets — proxies to NestJS POST /v1/workouts/exercises/:id/sets.
 *
 * S5.f of the supabase→clerk+nestjs migration.
 */
import { createError, defineEventHandler, getRouterParam, readBody } from 'h3';

import { createApiClient } from '../../../../utils/api-client';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Exercise ID is required' });

  const body = await readBody(event);
  return createApiClient(event)(`/v1/workouts/exercises/${id}/sets`, { method: 'POST', body });
});
