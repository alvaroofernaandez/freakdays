import { AppError } from "@/utils/error-handling";

type FetchOptions = Parameters<typeof $fetch>[1];

export interface ApiRequestOptions extends Omit<FetchOptions, "headers"> {
  headers?: Record<string, string>;
  requireOrg?: boolean;
}

function getDefaultErrorMessage(statusCode?: number): string {
  if (statusCode === 401) {
    return "Necesitás iniciar sesión para continuar.";
  }

  if (statusCode === 403) {
    return "No tenés permisos para realizar esta acción.";
  }

  if (statusCode === 404) {
    return "No se encontró el recurso solicitado.";
  }

  if (statusCode === 409) {
    return "El recurso ya existe o está en conflicto.";
  }

  if (statusCode && statusCode >= 500) {
    return "Error interno del servidor. Intentá nuevamente más tarde.";
  }

  return "Ocurrió un error al comunicarse con la API.";
}

function normalizeApiError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (typeof error === "object" && error !== null) {
    const errorLike = error as {
      status?: number;
      statusCode?: number;
      data?: { message?: string; code?: string; [key: string]: unknown };
      message?: string;
    };

    const statusCode = errorLike.statusCode ?? errorLike.status;
    const message =
      errorLike.data?.message ??
      errorLike.message ??
      getDefaultErrorMessage(statusCode);

    return new AppError(
      message,
      errorLike.data?.code,
      statusCode,
      errorLike.data ?? errorLike
    );
  }

  if (error instanceof Error) {
    return new AppError(error.message);
  }

  return new AppError("Error desconocido consumiendo la API.");
}

export function useApiClient() {
  const runtimeConfig = useRuntimeConfig();
  const authContext = useAuthContext();
  const organizationContext = useOrganizationContext();

  const baseURL = runtimeConfig.public.apiBaseUrl || "/api";

  async function request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const token = authContext.getAccessToken();
    const orgId = organizationContext.activeOrgId.value ?? authContext.getOrgId();

    if (options.requireOrg && !orgId) {
      throw new AppError(
        "Falta contexto de organización para ejecutar la operación.",
        "MISSING_ORG_CONTEXT",
        400
      );
    }

    const headers: Record<string, string> = {
      ...(options.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (orgId) {
      headers["x-org-id"] = orgId;
    }

    try {
      return await $fetch<T>(endpoint, {
        ...options,
        baseURL,
        headers,
      });
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  return {
    request,
    get: <T>(endpoint: string, options?: ApiRequestOptions) =>
      request<T>(endpoint, { ...options, method: "GET" }),
    post: <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
      request<T>(endpoint, { ...options, method: "POST", body }),
    put: <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
      request<T>(endpoint, { ...options, method: "PUT", body }),
    patch: <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
      request<T>(endpoint, { ...options, method: "PATCH", body }),
    del: <T>(endpoint: string, options?: ApiRequestOptions) =>
      request<T>(endpoint, { ...options, method: "DELETE" }),
    normalizeApiError,
  };
}
