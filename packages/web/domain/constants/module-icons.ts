import type { Component } from 'vue'
import { 
  Dumbbell, 
  BookOpen, 
  Tv, 
  Swords, 
  Users, 
  Calendar 
} from 'lucide-vue-next'
import type { ModuleId } from '../types'

export type ModuleIconName = 'dumbbell' | 'book-open' | 'tv' | 'sword' | 'users' | 'calendar'

export const MODULE_ICONS: Record<ModuleIconName, Component> = {
  dumbbell: Dumbbell,
  'book-open': BookOpen,
  tv: Tv,
  sword: Swords,
  users: Users,
  calendar: Calendar,
} as const

export function getModuleIcon(iconName: string): Component | undefined {
  return MODULE_ICONS[iconName as ModuleIconName]
}

