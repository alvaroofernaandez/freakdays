import type { Quest } from '../../domain/types'

export function formatDueDate(quest: Quest): string {
  if (!quest.dueDate) return ''
  const today = new Date()
  const dueDate = new Date(quest.dueDate)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (dueDate.toDateString() === today.toDateString()) return 'Hoy'
  if (dueDate.toDateString() === tomorrow.toDateString()) return 'Mañana'
  return dueDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function formatDueTime(quest: Quest): string {
  if (!quest.dueTime) return ''
  return quest.dueTime.substring(0, 5)
}

export function getTimeRemaining(quest: Quest): string {
  if (!quest.dueDate) return ''
  const now = new Date()
  const dueDateTime = quest.dueTime 
    ? new Date(`${quest.dueDate.toISOString().split('T')[0]}T${quest.dueTime}`)
    : new Date(quest.dueDate)
  dueDateTime.setHours(quest.dueTime ? parseInt(quest.dueTime.split(':')[0]) : 23, quest.dueTime ? parseInt(quest.dueTime.split(':')[1]) : 59, 59)
  
  const diff = dueDateTime.getTime() - now.getTime()
  if (diff < 0) return 'Atrasada'
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

