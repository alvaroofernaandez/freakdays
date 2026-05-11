export class AppError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
    public readonly details?: Record<string, any>
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export interface ErrorInfo {
  message: string
  code?: string
  statusCode?: number
  details?: Record<string, any>
  userMessage?: string
}

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }
  
  if (error instanceof Error) {
    return new AppError(error.message)
  }
  
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as any
    return new AppError(
      errorObj.message || 'An unexpected error occurred',
      errorObj.code,
      errorObj.statusCode || errorObj.status,
      errorObj.details || errorObj
    )
  }
  
  return new AppError('An unexpected error occurred')
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

export function getErrorMessage(error: unknown): string {
  const appError = handleError(error)
  
  if (appError.statusCode === 404) {
    return 'No se encontró el recurso solicitado'
  }
  
  if (appError.statusCode === 403) {
    return 'No tienes permisos para realizar esta acción'
  }
  
  if (appError.statusCode === 401) {
    return 'Necesitas iniciar sesión para realizar esta acción'
  }
  
  if (appError.statusCode === 429) {
    return 'Demasiadas solicitudes. Por favor, espera un momento'
  }
  
  if (appError.statusCode === 500 || appError.statusCode === 503) {
    return 'Error del servidor. Por favor, intenta más tarde'
  }
  
  if (appError.message) {
    return appError.message
  }
  
  return 'Ha ocurrido un error inesperado'
}

export function getErrorInfo(error: unknown): ErrorInfo {
  const appError = handleError(error)
  
  const userMessages: Record<number, string> = {
    404: 'No se encontró el recurso solicitado',
    403: 'No tienes permisos para realizar esta acción',
    401: 'Necesitas iniciar sesión para realizar esta acción',
    429: 'Demasiadas solicitudes. Por favor, espera un momento',
    500: 'Error del servidor. Por favor, intenta más tarde',
    503: 'Servicio no disponible. Por favor, intenta más tarde'
  }
  
  return {
    message: appError.message,
    code: appError.code,
    statusCode: appError.statusCode,
    details: appError.details,
    userMessage: appError.statusCode ? userMessages[appError.statusCode] : appError.message
  }
}

