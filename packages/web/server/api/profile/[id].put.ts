/**
 * PUT /api/profile/:id — proxies to NestJS PUT /v1/profile/me.
 *
 * S5.d of the supabase→clerk+nestjs migration.
 *
 * The `:id` URL param is no longer used: NestJS scopes by Clerk JWT subject.
 */
import { defineEventHandler, readBody } from 'h3';

import { createApiClient } from '../../utils/api-client';

export default defineEventHandler(async (event) => {
  const apiClient = createApiClient(event);
  const body = await readBody(event);

  return apiClient('/v1/profile/me', {
    method: 'PUT',
    body,
  });
});
