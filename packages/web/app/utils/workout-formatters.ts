export function formatDate(date: Date): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) return 'Hoy'
  if (date.toDateString() === yesterday.toDateString()) return 'Ayer'
  return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function formatDuration(minutes: number | null): string {
  if (!minutes) return '0 min'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
}

export function getElapsedTime(startTime: Date | null): string {
  if (!startTime) return '0 min'
  const elapsed = Math.round((new Date().getTime() - startTime.getTime()) / 60000)
  return formatDuration(elapsed)
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0] || ''
}

