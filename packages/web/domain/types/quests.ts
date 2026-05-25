export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'legendary';

export type QuestStatus = 'pending' | 'completed' | 'failed';

export interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: QuestDifficulty;
  exp: number;
  status: QuestStatus;
  streak: number;
  dueDate: Date | null;
  dueTime: string | null;
  reminderMinutesBefore: number | null;
  createdAt: Date;
  completedAt: Date | null;
  isOverdue?: boolean;
  isDueSoon?: boolean;
}

export const DIFFICULTY_EXP: Record<QuestDifficulty, number> = {
  easy: 10,
  medium: 25,
  hard: 50,
  legendary: 100,
};

// Re-exported from @freakdays/domain — kept here for backwards-compatible web imports
export { computeStreakBonusPct as calculateStreakBonus } from '@freakdays/domain';

export function calculateTotalExp(difficulty: QuestDifficulty, streak: number): number {
  const baseExp = DIFFICULTY_EXP[difficulty];
  const bonus = Math.floor(streak / 7) * 5;
  return baseExp + bonus;
}
