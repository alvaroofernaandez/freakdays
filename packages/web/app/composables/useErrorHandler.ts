import { getErrorMessage, getErrorInfo, type ErrorInfo } from '@/utils/error-handling'
import { useToast } from '@/composables/useToast'

export function useErrorHandler() {
  const toast = useToast()

  function handleError(error: unknown, options?: {
    showToast?: boolean
    toastDuration?: number
    customMessage?: string
  }) {
    const errorInfo = getErrorInfo(error)
    const message = options?.customMessage || errorInfo.userMessage || errorInfo.message

    if (options?.showToast !== false) {
      toast.error(message, options?.toastDuration)
    }

    if (import.meta.dev) {
      console.error('Error handled:', {
        message: errorInfo.message,
        code: errorInfo.code,
        statusCode: errorInfo.statusCode,
        details: errorInfo.details,
        originalError: error
      })
    }

    return errorInfo
  }

  function handleAsyncError<T>(
    promise: Promise<T>,
    options?: {
      showToast?: boolean
      toastDuration?: number
      customMessage?: string
      onError?: (error: ErrorInfo) => void
    }
  ): Promise<T | null> {
    return promise
      .then((result) => result)
      .catch((error) => {
        const errorInfo = handleError(error, options)
        
        if (options?.onError) {
          options.onError(errorInfo)
        }
        
        return null
      })
  }

  return {
    handleError,
    handleAsyncError,
    getErrorMessage,
    getErrorInfo
  }
}

