import { describe, expect, it } from 'vitest';

import { computeLevel, expForNextLevel } from './progression';

describe('computeLevel', () => {
  it('returns 1 when exp is 0', () => {
    expect(computeLevel(0)).toBe(1);
  });

  it('returns 1 when exp is 99 (below level-2 threshold)', () => {
    expect(computeLevel(99)).toBe(1);
  });

  it('returns 2 when exp is exactly 100', () => {
    expect(computeLevel(100)).toBe(2);
  });

  it('returns 3 when exp is 205 (above 200 threshold)', () => {
    expect(computeLevel(205)).toBe(3);
  });

  it('returns a positive integer for very large exp values (no NaN/overflow)', () => {
    const result = computeLevel(999999);
    expect(Number.isInteger(result)).toBe(true);
    expect(result).toBeGreaterThan(0);
  });

  it('is deterministic — same input always returns same output', () => {
    const a = computeLevel(350);
    const b = computeLevel(350);
    expect(a).toBe(b);
  });
});

describe('expForNextLevel', () => {
  it('returns correct progress breakdown for mid-level exp', () => {
    const result = expForNextLevel(150);
    expect(result.current).toBe(50);
    expect(result.needed).toBe(100);
    expect(result.progress).toBe(50);
  });

  it('returns current=0, needed=100, progress=0 at level boundary', () => {
    const result = expForNextLevel(200);
    expect(result.current).toBe(0);
    expect(result.needed).toBe(100);
    expect(result.progress).toBe(0);
  });

  it('returns current=99, needed=100, progress=99 just before next level', () => {
    const result = expForNextLevel(99);
    expect(result.current).toBe(99);
    expect(result.needed).toBe(100);
    expect(result.progress).toBe(99);
  });
});
