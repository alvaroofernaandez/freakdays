/**
 * Canonical pair after direction normalization.
 * requesterId = min(userA, userB) lexicographically.
 * addresseeId = max(userA, userB) lexicographically.
 */
export interface CanonicalPair {
  readonly requesterId: string;
  readonly addresseeId: string;
}
