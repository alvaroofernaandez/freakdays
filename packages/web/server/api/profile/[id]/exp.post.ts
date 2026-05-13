/**
 * POST /api/profile/:id/exp — proxies to NestJS POST /v1/profile/me/exp.
 *
 * S5.d of the supabase→clerk+nestjs migration.
 *
 * The `:id` URL param is no longer used: NestJS scopes by Clerk JWT subject.
 * Level calculation lives in the NestJS profile service.
 */
import { defineEventHandler, readBody } from 'h3';

import { createApiClient } from '../../../utils/api-client';

export default defineEventHandler(async (event) => {
  const apiClient = createApiClient(event);
  const body = await readBody(event);

  return apiClient('/v1/profile/me/exp', {
    method: 'POST',
    body,
  });
});
