/**
 * Gamification constants and pure rules.
 * Single source of truth for the entire monorepo.
 */

export const ACTIVITY_EXP = {
  workout: 30,
  animeEpisode: 5,
  animeComplete: 25,
  mangaChapter: 3,
  dailyLogin: 10,
} as const;

export type ActivityExpKey = keyof typeof ACTIVITY_EXP;

/**
 * Returns the streak bonus percentage (0–50).
 * Formula: min(floor(streak / 7) * 5, 50)
 */
export function computeStreakBonusPct(streak: number): number {
  return Math.min(Math.floor(streak / 7) * 5, 50);
}

/**
 * Returns the effective EXP after applying the streak bonus.
 * Truncated to integer: base + floor(base * pct / 100)
 */
export function effectiveExp(base: number, streak: number): number {
  const pct = computeStreakBonusPct(streak);
  return base + Math.floor((base * pct) / 100);
}
