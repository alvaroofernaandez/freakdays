/**
 * GET /api/quests/notifications — proxies to NestJS GET /v1/quests/notifications.
 *
 * S5.e of the supabase→clerk+nestjs migration.
 */
import { defineEventHandler } from 'h3';

import { createApiClient } from '../../utils/api-client';

export default defineEventHandler(async (event) => {
  const apiClient = createApiClient(event);

  return apiClient('/v1/quests/notifications');
});
