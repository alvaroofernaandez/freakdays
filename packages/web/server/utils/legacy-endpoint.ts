import { defineEventHandler } from "h3";

const LEGACY_DEPRECATION_BASE_MESSAGE =
  "Legacy endpoint deprecado: usar /api/v1/... en freak-days-api";

export function createLegacyEndpointDeprecatedError(endpoint: string) {
  return createError({
    statusCode: 410,
    statusMessage: "Gone",
    message: `${LEGACY_DEPRECATION_BASE_MESSAGE} (${endpoint})`,
    data: {
      deprecatedEndpoint: endpoint,
      replacement: "/api/v1/...",
    },
  });
}

export function legacyEndpointDeprecatedHandler(endpoint: string) {
  return defineEventHandler(() => {
    throw createLegacyEndpointDeprecatedError(endpoint);
  });
}
