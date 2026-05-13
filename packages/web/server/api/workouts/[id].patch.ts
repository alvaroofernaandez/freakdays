/**
 * PATCH /api/workouts/:id — proxies to NestJS PATCH /v1/workouts/:id.
 *
 * S5.f of the supabase→clerk+nestjs migration.
 */
import { createError, defineEventHandler, getRouterParam, readBody } from 'h3';

import { createApiClient } from '../../utils/api-client';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Workout ID is required' });

  const body = await readBody(event);
  return createApiClient(event)(`/v1/workouts/${id}`, { method: 'PATCH', body });
});
