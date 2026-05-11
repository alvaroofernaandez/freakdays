import type { Component } from 'vue'
import { Home } from 'lucide-vue-next'
import { useModulesStore } from '~~/stores/modules'
import { MODULE_ICONS } from '~~/domain/constants/module-icons'
import type { ModuleId } from '~~/domain/types'

export interface NavItem {
  to: string
  icon: Component
  label: string
}

const MODULE_ROUTES: Record<ModuleId, { to: string; label: string; iconName: keyof typeof MODULE_ICONS }> = {
  quests: { to: '/quests', label: 'Quests', iconName: 'sword' },
  anime: { to: '/anime', label: 'Anime', iconName: 'tv' },
  manga: { to: '/manga', label: 'Manga', iconName: 'book-open' },
  workouts: { to: '/workouts', label: 'Gym', iconName: 'dumbbell' },
  calendar: { to: '/calendar', label: 'Calendario', iconName: 'calendar' },
  party: { to: '/party', label: 'Party', iconName: 'users' },
} as const

export function getAllNavItems(modulesStore: ReturnType<typeof useModulesStore>): NavItem[] {
  const items: NavItem[] = [
    { to: '/', icon: Home, label: 'Inicio' }
  ]

  try {
    Object.entries(MODULE_ROUTES).forEach(([moduleId, route]) => {
      const module = modulesStore.getModuleById(moduleId as ModuleId)
      if (module?.enabled) {
        const icon = MODULE_ICONS[route.iconName]
        if (icon) {
          items.push({ 
            to: route.to, 
            icon, 
            label: route.label 
          })
        }
      }
    })
  } catch (error) {
    console.warn('Error loading nav items:', error)
  }

  return items
}

