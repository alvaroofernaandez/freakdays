/**
 * GET /api/profile/:id — proxies to NestJS GET /v1/profile/me.
 *
 * S5.d of the supabase→clerk+nestjs migration.
 *
 * The `:id` URL param is no longer used: NestJS scopes by Clerk JWT subject.
 * The proxy keeps the legacy URL shape for client backward compatibility.
 * Cross-user profile reads (someone viewing another user's profile) are a
 * separate NestJS endpoint and out of scope here.
 */
import { defineEventHandler } from 'h3';

import { createApiClient } from '../../utils/api-client';

export default defineEventHandler(async (event) => {
  const apiClient = createApiClient(event);

  return apiClient('/v1/profile/me');
});
