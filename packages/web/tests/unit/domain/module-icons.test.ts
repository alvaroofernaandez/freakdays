import { describe, it, expect } from 'vitest'
import { getModuleIcon, MODULE_ICONS, type ModuleIconName } from '../../../domain/constants/module-icons'

describe('module-icons', () => {
  describe('MODULE_ICONS', () => {
    it('should have all expected module icons', () => {
      const expectedIcons: ModuleIconName[] = [
        'dumbbell',
        'book-open',
        'tv',
        'sword',
        'users',
        'calendar',
      ]

      expectedIcons.forEach((iconName) => {
        expect(MODULE_ICONS[iconName]).toBeDefined()
        expect(typeof MODULE_ICONS[iconName]).toBe('function')
      })
    })

    it('should have correct number of icons', () => {
      expect(Object.keys(MODULE_ICONS).length).toBe(6)
    })
  })

  describe('getModuleIcon', () => {
    it('should return icon component for valid icon name', () => {
      const icon = getModuleIcon('dumbbell')
      expect(icon).toBeDefined()
      expect(icon).toBe(MODULE_ICONS.dumbbell)
    })

    it('should return icon component for all valid icon names', () => {
      const validIcons: ModuleIconName[] = [
        'dumbbell',
        'book-open',
        'tv',
        'sword',
        'users',
        'calendar',
      ]

      validIcons.forEach((iconName) => {
        const icon = getModuleIcon(iconName)
        expect(icon).toBeDefined()
        expect(icon).toBe(MODULE_ICONS[iconName])
      })
    })

    it('should return undefined for invalid icon name', () => {
      expect(getModuleIcon('invalid-icon')).toBeUndefined()
      expect(getModuleIcon('')).toBeUndefined()
      expect(getModuleIcon('unknown')).toBeUndefined()
    })

    it('should be case sensitive', () => {
      expect(getModuleIcon('Dumbbell')).toBeUndefined()
      expect(getModuleIcon('DUMBBELL')).toBeUndefined()
    })
  })
})

