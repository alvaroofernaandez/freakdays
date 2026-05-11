import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useToast } from '../../../app/composables/useToast'

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    const { clear } = useToast()
    clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('show', () => {
    it('should add a toast to the list', () => {
      const { toasts, show } = useToast()
      show('Test message', 'info')
      
      expect(toasts.value).toHaveLength(1)
      expect(toasts.value[0].message).toBe('Test message')
      expect(toasts.value[0].type).toBe('info')
    })

    it('should generate unique IDs for toasts', () => {
      const { toasts, show } = useToast()
      const id1 = show('Message 1', 'info')
      const id2 = show('Message 2', 'info')
      
      expect(id1).not.toBe(id2)
      expect(toasts.value).toHaveLength(2)
    })

    it('should use custom duration', () => {
      const { toasts, show } = useToast()
      show('Test', 'info', 5000)
      
      expect(toasts.value[0].duration).toBe(5000)
    })

    it('should auto-remove toast after duration', () => {
      const { toasts, show } = useToast()
      show('Test', 'info', 1000)
      
      expect(toasts.value).toHaveLength(1)
      
      vi.advanceTimersByTime(1000)
      
      expect(toasts.value).toHaveLength(0)
    })

    it('should not auto-remove if duration is 0', () => {
      const { toasts, show } = useToast()
      show('Test', 'info', 0)
      
      vi.advanceTimersByTime(10000)
      
      expect(toasts.value).toHaveLength(1)
    })
  })

  describe('success', () => {
    it('should create a success toast', () => {
      const { toasts, success } = useToast()
      success('Success message')
      
      expect(toasts.value[0].type).toBe('success')
      expect(toasts.value[0].message).toBe('Success message')
    })

    it('should use default duration of 3000ms', () => {
      const { toasts, success } = useToast()
      success('Test')
      
      expect(toasts.value[0].duration).toBe(3000)
    })
  })

  describe('error', () => {
    it('should create an error toast', () => {
      const { toasts, error } = useToast()
      error('Error message')
      
      expect(toasts.value[0].type).toBe('error')
      expect(toasts.value[0].message).toBe('Error message')
    })

    it('should use default duration of 4000ms', () => {
      const { toasts, error } = useToast()
      error('Test')
      
      expect(toasts.value[0].duration).toBe(4000)
    })
  })

  describe('info', () => {
    it('should create an info toast', () => {
      const { toasts, info } = useToast()
      info('Info message')
      
      expect(toasts.value[0].type).toBe('info')
      expect(toasts.value[0].message).toBe('Info message')
    })
  })

  describe('warning', () => {
    it('should create a warning toast', () => {
      const { toasts, warning } = useToast()
      warning('Warning message')
      
      expect(toasts.value[0].type).toBe('warning')
      expect(toasts.value[0].message).toBe('Warning message')
    })
  })

  describe('remove', () => {
    it('should remove a toast by ID', () => {
      const { toasts, show, remove } = useToast()
      const id = show('Test', 'info')
      
      expect(toasts.value).toHaveLength(1)
      
      remove(id)
      
      expect(toasts.value).toHaveLength(0)
    })

    it('should not throw if ID does not exist', () => {
      const { remove } = useToast()
      
      expect(() => remove('non-existent-id')).not.toThrow()
    })
  })

  describe('clear', () => {
    it('should remove all toasts', () => {
      const { toasts, show, clear } = useToast()
      show('Message 1', 'info')
      show('Message 2', 'error')
      show('Message 3', 'warning')
      
      expect(toasts.value).toHaveLength(3)
      
      clear()
      
      expect(toasts.value).toHaveLength(0)
    })
  })

  describe('readonly toasts', () => {
    it('should return readonly ref', () => {
      const { toasts, show } = useToast()
      show('Test', 'info')
      
      const originalLength = toasts.value.length
      try {
        // @ts-expect-error - testing readonly
        toasts.value = []
      } catch {
        // readonly refs may not throw in runtime, only TypeScript prevents assignment
      }
      expect(toasts.value.length).toBe(originalLength)
    })
  })
})

