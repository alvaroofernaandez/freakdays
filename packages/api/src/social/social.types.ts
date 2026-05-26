/**
 * Canonical pair after direction normalization.
 * requesterId = min(userA, userB) lexicographically.
 * addresseeId = max(userA, userB) lexicographically.
 */
export interface CanonicalPair {
  readonly requesterId: string;
  readonly addresseeId: string;
}

/**
 * Direction labels for pending friendship requests.
 * - 'incoming': the caller is the addressee (someone sent them a request)
 * - 'outgoing': the caller is the initiator (they sent the request)
 */
export const PENDING_DIRECTION = {
  incoming: 'incoming',
  outgoing: 'outgoing',
} as const;

export type PendingDirection = (typeof PENDING_DIRECTION)[keyof typeof PENDING_DIRECTION];

export interface PendingRequestWithDirection {
  readonly id: string;
  readonly requesterId: string;
  readonly addresseeId: string;
  readonly initiatorId: string;
  readonly status: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly direction: PendingDirection;
}
