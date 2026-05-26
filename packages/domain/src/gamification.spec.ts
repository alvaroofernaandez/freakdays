import { describe, expect, it } from 'vitest';

import { ACTIVITY_EXP, computeStreakBonusPct, effectiveExp } from './gamification';

describe('ACTIVITY_EXP', () => {
  it('workout is 30', () => {
    expect(ACTIVITY_EXP.workout).toBe(30);
  });

  it('animeEpisode is 5', () => {
    expect(ACTIVITY_EXP.animeEpisode).toBe(5);
  });

  it('animeComplete is 25', () => {
    expect(ACTIVITY_EXP.animeComplete).toBe(25);
  });

  it('mangaChapter is 3', () => {
    expect(ACTIVITY_EXP.mangaChapter).toBe(3);
  });

  it('dailyLogin is 10', () => {
    expect(ACTIVITY_EXP.dailyLogin).toBe(10);
  });
});

describe('computeStreakBonusPct', () => {
  it('returns 0 for streak=0', () => {
    expect(computeStreakBonusPct(0)).toBe(0);
  });

  it('returns 0 for streak below 7', () => {
    expect(computeStreakBonusPct(6)).toBe(0);
  });

  it('returns 5 for streak=7', () => {
    expect(computeStreakBonusPct(7)).toBe(5);
  });

  it('returns 5 for streak=13 (still one full week)', () => {
    expect(computeStreakBonusPct(13)).toBe(5);
  });

  it('returns 10 for streak=14', () => {
    expect(computeStreakBonusPct(14)).toBe(10);
  });

  it('caps at 50 for streak=70', () => {
    expect(computeStreakBonusPct(70)).toBe(50);
  });

  it('caps at 50 for streak=77 (above cap)', () => {
    expect(computeStreakBonusPct(77)).toBe(50);
  });

  it('caps at 50 for very large streak', () => {
    expect(computeStreakBonusPct(999)).toBe(50);
  });
});

describe('effectiveExp', () => {
  it('returns base EXP when streak=0 (no bonus)', () => {
    expect(effectiveExp(30, 0)).toBe(30);
  });

  it('floor(30 * 1.05) = 31 for streak=7', () => {
    expect(effectiveExp(30, 7)).toBe(31);
  });

  it('floor(10 * 1.50) = 15 for streak=70', () => {
    expect(effectiveExp(10, 70)).toBe(15);
  });

  it('returns same as base when bonus is 0 percent', () => {
    expect(effectiveExp(5, 3)).toBe(5);
  });
});
