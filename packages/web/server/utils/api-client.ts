/**
 * HTTP client for the Nuxt server layer to forward requests to the NestJS
 * API at `packages/api`.
 *
 * Design (intentionally minimal):
 *
 * - The web server does NOT verify the Clerk JWT locally. It only forwards
 *   the `Authorization` header from the incoming request to NestJS, which
 *   verifies the token via Clerk JWKS (see
 *   packages/api/src/auth/strategies/clerk-jwt.strategy.ts).
 *
 * - All endpoint paths are passed verbatim to `$fetch`, so call sites look
 *   like `apiClient('/anime')` and the absolute URL is built from the
 *   `NUXT_PUBLIC_API_URL` runtime config.
 *
 * This primitive is the foundation for sub-phases S4..S6 of the
 * supabase→clerk+nestjs migration (docs/migrations/supabase-to-clerk-nestjs.md).
 */
import type { H3Event } from 'h3';
import { createError, getRequestHeader } from 'h3';
import type { $Fetch } from 'ofetch';

export function createApiClient(event: H3Event): $Fetch {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiUrl;

  if (!baseURL) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'NUXT_PUBLIC_API_URL is not configured. Set it in .env or runtimeConfig.public.apiUrl.',
    });
  }

  const authorization = getRequestHeader(event, 'authorization');

  if (!authorization) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Missing Authorization header',
    });
  }

  return $fetch.create({
    baseURL,
    headers: {
      authorization,
    },
  });
}
