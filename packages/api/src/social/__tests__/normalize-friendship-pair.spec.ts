import { normalizeFriendshipPair } from '../normalize-friendship-pair';

describe('normalizeFriendshipPair', () => {
  it('(a) canonical ordering: smaller userId becomes requesterId', () => {
    const result = normalizeFriendshipPair('user-zzz', 'user-aaa');
    expect(result).not.toBeNull();
    expect(result!.requesterId).toBe('user-aaa');
    expect(result!.addresseeId).toBe('user-zzz');
  });

  it('(b) commutative: same result regardless of argument order', () => {
    const r1 = normalizeFriendshipPair('user-aaa', 'user-zzz');
    const r2 = normalizeFriendshipPair('user-zzz', 'user-aaa');
    expect(r1).toEqual(r2);
  });

  it('(c) self-pair returns null', () => {
    const result = normalizeFriendshipPair('user-abc', 'user-abc');
    expect(result).toBeNull();
  });

  it('(d) already ordered pair stays the same', () => {
    const result = normalizeFriendshipPair('user-aaa', 'user-bbb');
    expect(result!.requesterId).toBe('user-aaa');
    expect(result!.addresseeId).toBe('user-bbb');
  });

  it('(e) direction normalization correctness per spec', () => {
    // Spec: user-zzz sends to user-aaa → stored as requesterId=user-aaa
    const result = normalizeFriendshipPair('user-zzz', 'user-aaa');
    expect(result!.requesterId).toBe('user-aaa');
    expect(result!.addresseeId).toBe('user-zzz');
  });
});
