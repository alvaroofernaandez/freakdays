/**
 * POST /api/manga — proxies to NestJS POST /v1/manga.
 *
 * S5.b of the supabase→clerk+nestjs migration.
 */
import { defineEventHandler, readBody } from 'h3';

import { createApiClient } from '../../utils/api-client';

export default defineEventHandler(async (event) => {
  const apiClient = createApiClient(event);
  const body = await readBody(event);

  return apiClient('/v1/manga', {
    method: 'POST',
    body,
  });
});
