import type { CanonicalPair } from './social.types';

/**
 * Normalizes two user ids into a canonical pair for the Friendship model.
 * The user with the lexicographically smaller id is always stored as requesterId.
 * This ensures the @@unique([requesterId, addresseeId]) constraint covers both
 * directions — no reverse-pair duplicates possible.
 *
 * Returns null if both ids are the same (self-friend guard).
 */
export function normalizeFriendshipPair(userA: string, userB: string): CanonicalPair | null {
  if (userA === userB) {
    return null;
  }

  const requesterId = userA < userB ? userA : userB;
  const addresseeId = userA < userB ? userB : userA;

  return { requesterId, addresseeId };
}
