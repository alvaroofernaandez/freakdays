/**
 * DELETE /api/workouts/sets/:id — proxies to NestJS DELETE /v1/workouts/sets/:id.
 *
 * S5.f of the supabase→clerk+nestjs migration.
 */
import { createError, defineEventHandler, getRouterParam } from 'h3';

import { createApiClient } from '../../../utils/api-client';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Set ID is required' });

  return createApiClient(event)(`/v1/workouts/sets/${id}`, { method: 'DELETE' });
});
