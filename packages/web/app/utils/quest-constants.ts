import type { QuestDifficulty } from '../../domain/types'

export const DIFFICULTY_COLORS: Record<QuestDifficulty, string> = {
  easy: 'bg-exp-easy/20 text-exp-easy border-exp-easy/30',
  medium: 'bg-exp-medium/20 text-exp-medium border-exp-medium/30',
  hard: 'bg-exp-hard/20 text-exp-hard border-exp-hard/30',
  legendary: 'bg-exp-legendary/20 text-exp-legendary border-exp-legendary/30'
} as const

export const DIFFICULTY_LABELS: Record<QuestDifficulty, string> = {
  easy: 'Fácil',
  medium: 'Normal',
  hard: 'Difícil',
  legendary: 'Legendaria'
} as const

