/**
 * POST /api/quests — proxies to NestJS POST /v1/quests.
 *
 * S5.e of the supabase→clerk+nestjs migration.
 */
import { defineEventHandler, readBody } from 'h3';

import { createApiClient } from '../../utils/api-client';

export default defineEventHandler(async (event) => {
  const apiClient = createApiClient(event);
  const body = await readBody(event);

  return apiClient('/v1/quests', {
    method: 'POST',
    body,
  });
});
