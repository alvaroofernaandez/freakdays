import { describe, it, expect } from 'vitest'
import {
  AppError,
  handleError,
  isAppError,
  getErrorMessage,
  getErrorInfo,
} from '../../../app/utils/error-handling'

describe('error-handling', () => {
  describe('AppError', () => {
    it('should create error with message', () => {
      const error = new AppError('Test error')

      expect(error.message).toBe('Test error')
      expect(error.name).toBe('AppError')
      expect(error).toBeInstanceOf(Error)
    })

    it('should create error with code', () => {
      const error = new AppError('Test error', 'TEST_CODE')

      expect(error.code).toBe('TEST_CODE')
    })

    it('should create error with statusCode', () => {
      const error = new AppError('Test error', undefined, 404)

      expect(error.statusCode).toBe(404)
    })

    it('should create error with details', () => {
      const details = { field: 'test' }
      const error = new AppError('Test error', undefined, undefined, details)

      expect(error.details).toEqual(details)
    })
  })

  describe('handleError', () => {
    it('should return AppError if already AppError', () => {
      const appError = new AppError('Test error')
      const result = handleError(appError)

      expect(result).toBe(appError)
    })

    it('should convert Error to AppError', () => {
      const error = new Error('Test error')
      const result = handleError(error)

      expect(result).toBeInstanceOf(AppError)
      expect(result.message).toBe('Test error')
    })

    it('should handle error object with message', () => {
      const error = { message: 'Test error' }
      const result = handleError(error)

      expect(result).toBeInstanceOf(AppError)
      expect(result.message).toBe('Test error')
    })

    it('should handle error object with code', () => {
      const error = { message: 'Test error', code: 'TEST_CODE' }
      const result = handleError(error)

      expect(result.code).toBe('TEST_CODE')
    })

    it('should handle error object with statusCode', () => {
      const error = { message: 'Test error', statusCode: 404 }
      const result = handleError(error)

      expect(result.statusCode).toBe(404)
    })

    it('should handle error object with status', () => {
      const error = { message: 'Test error', status: 500 }
      const result = handleError(error)

      expect(result.statusCode).toBe(500)
    })

    it('should handle error object with details', () => {
      const error = { message: 'Test error', details: { field: 'test' } }
      const result = handleError(error)

      expect(result.details).toEqual({ field: 'test' })
    })

    it('should use error object as details if no details field', () => {
      const error = { message: 'Test error', customField: 'value' }
      const result = handleError(error)

      expect(result.details).toEqual(error)
    })

    it('should handle unknown error types', () => {
      const result = handleError('string error')

      expect(result).toBeInstanceOf(AppError)
      expect(result.message).toBe('An unexpected error occurred')
    })

    it('should handle null error', () => {
      const result = handleError(null)

      expect(result).toBeInstanceOf(AppError)
      expect(result.message).toBe('An unexpected error occurred')
    })
  })

  describe('isAppError', () => {
    it('should return true for AppError', () => {
      const error = new AppError('Test error')
      expect(isAppError(error)).toBe(true)
    })

    it('should return false for regular Error', () => {
      const error = new Error('Test error')
      expect(isAppError(error)).toBe(false)
    })

    it('should return false for other types', () => {
      expect(isAppError('string')).toBe(false)
      expect(isAppError(null)).toBe(false)
      expect(isAppError({})).toBe(false)
    })
  })

  describe('getErrorMessage', () => {
    it('should return Spanish message for 404', () => {
      const error = new AppError('Not found', undefined, 404)
      const message = getErrorMessage(error)

      expect(message).toBe('No se encontró el recurso solicitado')
    })

    it('should return Spanish message for 403', () => {
      const error = new AppError('Forbidden', undefined, 403)
      const message = getErrorMessage(error)

      expect(message).toBe('No tienes permisos para realizar esta acción')
    })

    it('should return Spanish message for 401', () => {
      const error = new AppError('Unauthorized', undefined, 401)
      const message = getErrorMessage(error)

      expect(message).toBe('Necesitas iniciar sesión para realizar esta acción')
    })

    it('should return Spanish message for 429', () => {
      const error = new AppError('Too many requests', undefined, 429)
      const message = getErrorMessage(error)

      expect(message).toBe('Demasiadas solicitudes. Por favor, espera un momento')
    })

    it('should return Spanish message for 500', () => {
      const error = new AppError('Server error', undefined, 500)
      const message = getErrorMessage(error)

      expect(message).toBe('Error del servidor. Por favor, intenta más tarde')
    })

    it('should return Spanish message for 503', () => {
      const error = new AppError('Service unavailable', undefined, 503)
      const message = getErrorMessage(error)

      expect(message).toBe('Error del servidor. Por favor, intenta más tarde')
    })

    it('should return error message if no statusCode', () => {
      const error = new AppError('Custom error')
      const message = getErrorMessage(error)

      expect(message).toBe('Custom error')
    })

    it('should return default message if no message', () => {
      const error = {}
      const appError = handleError(error)
      const message = getErrorMessage(appError)

      expect(appError.message).toBe('An unexpected error occurred')
      expect(message).toBe('An unexpected error occurred')
    })
  })

  describe('getErrorInfo', () => {
    it('should return complete error info', () => {
      const error = new AppError('Test error', 'TEST_CODE', 404, { field: 'test' })
      const info = getErrorInfo(error)

      expect(info.message).toBe('Test error')
      expect(info.code).toBe('TEST_CODE')
      expect(info.statusCode).toBe(404)
      expect(info.details).toEqual({ field: 'test' })
      expect(info.userMessage).toBe('No se encontró el recurso solicitado')
    })

    it('should return user message for known status codes', () => {
      const statusCodes = [404, 403, 401, 429, 500, 503]

      statusCodes.forEach((statusCode) => {
        const error = new AppError('Test', undefined, statusCode)
        const info = getErrorInfo(error)

        expect(info.userMessage).toBeDefined()
        expect(typeof info.userMessage).toBe('string')
      })
    })

    it('should use error message as userMessage if no statusCode', () => {
      const error = new AppError('Custom error')
      const info = getErrorInfo(error)

      expect(info.userMessage).toBe('Custom error')
    })
  })
})

