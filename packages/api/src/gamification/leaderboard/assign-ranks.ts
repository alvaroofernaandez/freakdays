export interface ProfileLike {
  readonly userId: string;
  readonly totalExp: number;
  readonly level: number;
  readonly currentStreak: number;
  readonly displayName: string | null;
  readonly avatarUrl: string | null;
}

export interface RankedEntry {
  readonly rank: number;
  readonly userId: string;
  readonly totalExp: number;
  readonly level: number;
  readonly currentStreak: number;
  readonly displayName: string | null;
  readonly avatarUrl: string | null;
}

/** Sort comparator: totalExp DESC → level DESC → currentStreak DESC → userId ASC */
function rankComparator(a: ProfileLike, b: ProfileLike): number {
  if (b.totalExp !== a.totalExp) return b.totalExp - a.totalExp;
  if (b.level !== a.level) return b.level - a.level;
  if (b.currentStreak !== a.currentStreak) return b.currentStreak - a.currentStreak;
  return a.userId < b.userId ? -1 : a.userId > b.userId ? 1 : 0;
}

/**
 * Assigns 1-based ranks to profiles using the multi-field tiebreak.
 * Does NOT mutate the input array.
 */
export function assignRanks(profiles: readonly ProfileLike[]): RankedEntry[] {
  const sorted = [...profiles].sort(rankComparator);
  return sorted.map((p, i) => ({
    rank: i + 1,
    userId: p.userId,
    totalExp: p.totalExp,
    level: p.level,
    currentStreak: p.currentStreak,
    displayName: p.displayName,
    avatarUrl: p.avatarUrl,
  }));
}
