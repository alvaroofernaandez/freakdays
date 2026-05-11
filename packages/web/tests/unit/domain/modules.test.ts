import { describe, it, expect } from 'vitest'
import { ALL_MODULES, type ModuleId, type AppModule } from '../../../domain/types/modules'

describe('modules types', () => {
  describe('ALL_MODULES', () => {
    it('should have all expected modules', () => {
      const expectedModuleIds: ModuleId[] = [
        'workouts',
        'manga',
        'anime',
        'quests',
        'party',
        'calendar',
      ]

      expect(ALL_MODULES.length).toBe(expectedModuleIds.length)

      expectedModuleIds.forEach((moduleId) => {
        const module = ALL_MODULES.find((m) => m.id === moduleId)
        expect(module).toBeDefined()
        expect(module?.id).toBe(moduleId)
      })
    })

    it('should have correct structure for each module', () => {
      ALL_MODULES.forEach((module) => {
        expect(module).toHaveProperty('id')
        expect(module).toHaveProperty('name')
        expect(module).toHaveProperty('description')
        expect(module).toHaveProperty('icon')
        expect(module).toHaveProperty('enabled')

        expect(typeof module.id).toBe('string')
        expect(typeof module.name).toBe('string')
        expect(typeof module.description).toBe('string')
        expect(typeof module.icon).toBe('string')
        expect(typeof module.enabled).toBe('boolean')
      })
    })

    it('should have unique module IDs', () => {
      const ids = ALL_MODULES.map((m) => m.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have all modules disabled by default', () => {
      ALL_MODULES.forEach((module) => {
        expect(module.enabled).toBe(false)
      })
    })

    it('should have correct module data', () => {
      const workoutsModule = ALL_MODULES.find((m) => m.id === 'workouts')
      expect(workoutsModule?.name).toBe('Entrenamientos')
      expect(workoutsModule?.description).toBe('Registra y sigue tus entrenamientos')
      expect(workoutsModule?.icon).toBe('dumbbell')

      const mangaModule = ALL_MODULES.find((m) => m.id === 'manga')
      expect(mangaModule?.name).toBe('Colección Manga')
      expect(mangaModule?.description).toBe('Gestiona tu colección de mangas')
      expect(mangaModule?.icon).toBe('book-open')

      const animeModule = ALL_MODULES.find((m) => m.id === 'anime')
      expect(animeModule?.name).toBe('Anime')
      expect(animeModule?.description).toBe('Lleva el control de tus animes')
      expect(animeModule?.icon).toBe('tv')

      const questsModule = ALL_MODULES.find((m) => m.id === 'quests')
      expect(questsModule?.name).toBe('Misiones Diarias')
      expect(questsModule?.description).toBe('Convierte tus tareas en quests')
      expect(questsModule?.icon).toBe('sword')

      const partyModule = ALL_MODULES.find((m) => m.id === 'party')
      expect(partyModule?.name).toBe('Party System')
      expect(partyModule?.description).toBe('Crea grupos con amigos')
      expect(partyModule?.icon).toBe('users')

      const calendarModule = ALL_MODULES.find((m) => m.id === 'calendar')
      expect(calendarModule?.name).toBe('Calendario')
      expect(calendarModule?.description).toBe('Próximos lanzamientos y eventos')
      expect(calendarModule?.icon).toBe('calendar')
    })

    it('should have valid icon names', () => {
      const validIcons = ['dumbbell', 'book-open', 'tv', 'sword', 'users', 'calendar']
      ALL_MODULES.forEach((module) => {
        expect(validIcons).toContain(module.icon)
      })
    })

    it('should be a readonly array', () => {
      expect(Array.isArray(ALL_MODULES)).toBe(true)
      expect(ALL_MODULES.length).toBeGreaterThan(0)
    })
  })
})

