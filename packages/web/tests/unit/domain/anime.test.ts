import { describe, it, expect } from 'vitest'
import { ANIME_STATUS_LABELS, type AnimeStatus } from '../../../domain/types/anime'

describe('anime types', () => {
  describe('ANIME_STATUS_LABELS', () => {
    it('should have labels for all anime statuses', () => {
      const statuses: AnimeStatus[] = [
        'watching',
        'completed',
        'on_hold',
        'dropped',
        'plan_to_watch',
        'rewatching',
      ]

      statuses.forEach((status) => {
        expect(ANIME_STATUS_LABELS[status]).toBeDefined()
        expect(typeof ANIME_STATUS_LABELS[status]).toBe('string')
        expect(ANIME_STATUS_LABELS[status].length).toBeGreaterThan(0)
      })
    })

    it('should have correct Spanish labels', () => {
      expect(ANIME_STATUS_LABELS.watching).toBe('En curso')
      expect(ANIME_STATUS_LABELS.completed).toBe('Visto')
      expect(ANIME_STATUS_LABELS.on_hold).toBe('En pausa')
      expect(ANIME_STATUS_LABELS.dropped).toBe('Droppeado')
      expect(ANIME_STATUS_LABELS.plan_to_watch).toBe('Pendiente')
      expect(ANIME_STATUS_LABELS.rewatching).toBe('Rewatch')
    })

    it('should have all expected status keys', () => {
      const expectedKeys: AnimeStatus[] = [
        'watching',
        'completed',
        'on_hold',
        'dropped',
        'plan_to_watch',
        'rewatching',
      ]

      const actualKeys = Object.keys(ANIME_STATUS_LABELS) as AnimeStatus[]
      expect(actualKeys.length).toBe(expectedKeys.length)
      expectedKeys.forEach((key) => {
        expect(actualKeys).toContain(key)
      })
    })
  })
})

