export const LEVEL_EXP_STEP = 100 as const;

/**
 * Canonical EXP-to-level formula. Single source of truth for the entire monorepo.
 * Formula: floor(exp / LEVEL_EXP_STEP) + 1  (minimum level is 1)
 */
export function computeLevel(exp: number): number {
  return Math.floor(exp / LEVEL_EXP_STEP) + 1;
}

export interface ExpProgress {
  readonly current: number;
  readonly needed: number;
  readonly progress: number;
}

/**
 * Returns how many EXP the user has accumulated within the current level,
 * how many are needed to reach the next level, and the percentage progress.
 */
export function expForNextLevel(currentExp: number): ExpProgress {
  const level = computeLevel(currentExp);
  const expAtCurrentLevelStart = (level - 1) * LEVEL_EXP_STEP;
  const current = currentExp - expAtCurrentLevelStart;
  const needed = LEVEL_EXP_STEP;
  const progress = (current / needed) * 100;

  return { current, needed, progress };
}
