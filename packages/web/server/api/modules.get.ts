/**
 * GET /api/modules — proxies the current user's module preferences from the
 * NestJS API at GET /v1/modules/me.
 *
 * Added in S4 of the supabase→clerk+nestjs migration. The auth middleware
 * used to call `supabase.from('user_modules').select(...)` directly. After
 * the migration the middleware $fetches this endpoint with the Clerk JWT
 * forwarded via the standard Authorization header.
 *
 * Translates NestJS's camelCase response shape (`moduleId`) back to the
 * snake_case shape expected by `useModulesStore.setModulesFromDb` so the
 * store keeps working without changes. The store rename to camelCase is a
 * separate follow-up.
 */
import { defineEventHandler } from 'h3';

import { createApiClient } from '../utils/api-client';

interface NestModulePreference {
  moduleId: string;
  enabled: boolean;
}

export default defineEventHandler(async (event) => {
  const apiClient = createApiClient(event);
  const modules = await apiClient<NestModulePreference[]>('/v1/modules/me');

  return modules.map((m) => ({
    module_id: m.moduleId,
    enabled: m.enabled,
  }));
});
