import { assignRanks, type ProfileLike } from '../assign-ranks';

const makeProfile = (
  userId: string,
  totalExp: number,
  level = 1,
  currentStreak = 0,
  displayName: string | null = null,
  avatarUrl: string | null = null,
): ProfileLike => ({
  userId,
  totalExp,
  level,
  currentStreak,
  displayName,
  avatarUrl,
});

describe('assignRanks', () => {
  it('empty input returns empty array', () => {
    expect(assignRanks([])).toEqual([]);
  });

  it('single profile gets rank 1', () => {
    const result = assignRanks([makeProfile('u1', 1000)]);
    expect(result).toHaveLength(1);
    expect(result[0]!.rank).toBe(1);
    expect(result[0]!.userId).toBe('u1');
  });

  it('orders by totalExp DESC', () => {
    const profiles = [makeProfile('u1', 500), makeProfile('u2', 1000), makeProfile('u3', 200)];
    const result = assignRanks(profiles);
    expect(result[0]!.userId).toBe('u2'); // highest exp
    expect(result[0]!.rank).toBe(1);
    expect(result[1]!.userId).toBe('u1');
    expect(result[1]!.rank).toBe(2);
    expect(result[2]!.userId).toBe('u3');
    expect(result[2]!.rank).toBe(3);
  });

  it('tiebreak on level DESC when exp is equal', () => {
    const profiles = [makeProfile('u1', 1000, 3), makeProfile('u2', 1000, 5)];
    const result = assignRanks(profiles);
    expect(result[0]!.userId).toBe('u2'); // higher level
    expect(result[1]!.userId).toBe('u1');
  });

  it('tiebreak on currentStreak DESC when exp+level equal', () => {
    const profiles = [makeProfile('u1', 1000, 5, 2), makeProfile('u2', 1000, 5, 7)];
    const result = assignRanks(profiles);
    expect(result[0]!.userId).toBe('u2'); // higher streak
    expect(result[1]!.userId).toBe('u1');
  });

  it('tiebreak on userId ASC when all numeric fields equal (stable)', () => {
    const profiles = [makeProfile('user-zzz', 1000, 5, 3), makeProfile('user-aaa', 1000, 5, 3)];
    const result = assignRanks(profiles);
    expect(result[0]!.userId).toBe('user-aaa'); // lexicographically smaller
    expect(result[1]!.userId).toBe('user-zzz');
  });

  it('full multi-field tiebreak chain', () => {
    const profiles = [
      makeProfile('user-d', 500, 3, 5),
      makeProfile('user-c', 1000, 5, 3),
      makeProfile('user-a', 1000, 5, 3),
      makeProfile('user-b', 1000, 5, 7),
    ];
    const result = assignRanks(profiles);
    // 1st: user-b (exp=1000, level=5, streak=7)
    // 2nd: user-a (exp=1000, level=5, streak=3, userId 'user-a' < 'user-c')
    // 3rd: user-c (exp=1000, level=5, streak=3)
    // 4th: user-d (exp=500)
    expect(result[0]!.userId).toBe('user-b');
    expect(result[0]!.rank).toBe(1);
    expect(result[1]!.userId).toBe('user-a');
    expect(result[1]!.rank).toBe(2);
    expect(result[2]!.userId).toBe('user-c');
    expect(result[2]!.rank).toBe(3);
    expect(result[3]!.userId).toBe('user-d');
    expect(result[3]!.rank).toBe(4);
  });

  it('preserves displayName and avatarUrl in output', () => {
    const profiles = [makeProfile('u1', 100, 1, 0, 'Alice', 'https://img/1.jpg')];
    const result = assignRanks(profiles);
    expect(result[0]!.displayName).toBe('Alice');
    expect(result[0]!.avatarUrl).toBe('https://img/1.jpg');
  });

  it('does not mutate input array', () => {
    const profiles = [makeProfile('u1', 200), makeProfile('u2', 100)];
    const originalOrder = profiles.map((p) => p.userId);
    assignRanks(profiles);
    expect(profiles.map((p) => p.userId)).toEqual(originalOrder);
  });
});
