/**
 * PUT /api/modules — proxies to NestJS PUT /v1/modules/me.
 *
 * Added in S8.2 of the supabase→clerk+nestjs migration. Replaces the
 * per-module Supabase upsert that lived in `useModulesStore.syncToDatabase`
 * with a single bulk-sync call.
 */
import { createError, defineEventHandler, readBody } from 'h3';
import { z } from 'zod';

import { createApiClient } from '../utils/api-client';

const syncModulesSchema = z.object({
  modules: z.array(
    z.object({
      moduleId: z.string().min(1, 'moduleId must not be empty'),
      enabled: z.boolean(),
    }),
  ),
});

export default defineEventHandler(async (event) => {
  const apiClient = createApiClient(event);
  const rawBody = await readBody(event);

  const result = syncModulesSchema.safeParse(rawBody);
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request body',
      data: result.error.flatten(),
    });
  }

  return apiClient('/v1/modules/me', {
    method: 'PUT',
    body: result.data,
  });
});
