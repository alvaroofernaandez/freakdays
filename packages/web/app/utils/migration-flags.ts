type RuntimeConfigPublic = {
  enableSupabaseFallback?: string | boolean;
};

function toBooleanFlag(value: string | boolean | undefined): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value !== "string") {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1";
}

export function isSupabaseFallbackEnabled(): boolean {
  try {
    const maybeUseRuntimeConfig = (
      globalThis as { useRuntimeConfig?: () => { public?: RuntimeConfigPublic } }
    ).useRuntimeConfig;

    if (typeof maybeUseRuntimeConfig !== "function") {
      return false;
    }

    const runtimeConfig = maybeUseRuntimeConfig();
    const publicConfig = runtimeConfig?.public as RuntimeConfigPublic | undefined;

    return toBooleanFlag(publicConfig?.enableSupabaseFallback);
  } catch {
    return false;
  }
}
