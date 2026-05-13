/**
 * PUT /api/modules — proxies to NestJS PUT /v1/modules/me.
 *
 * Added in S8.2 of the supabase→clerk+nestjs migration. Replaces the
 * per-module Supabase upsert that lived in `useModulesStore.syncToDatabase`
 * with a single bulk-sync call.
 */
import { defineEventHandler, readBody } from 'h3';

import { createApiClient } from '../utils/api-client';

interface SyncModulesBody {
  modules: Array<{ moduleId: string; enabled: boolean }>;
}

export default defineEventHandler(async (event) => {
  const apiClient = createApiClient(event);
  const body = await readBody<SyncModulesBody>(event);

  return apiClient('/v1/modules/me', {
    method: 'PUT',
    body,
  });
});
