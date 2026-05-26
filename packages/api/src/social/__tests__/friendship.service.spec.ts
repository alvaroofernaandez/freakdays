import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { FriendshipStatus } from '@prisma/client';
import { PENDING_DIRECTION } from '../social.types';
import { FriendshipService } from '../friendship.service';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'fs-1',
  requesterId: 'user-aaa',
  addresseeId: 'user-zzz',
  initiatorId: 'user-aaa',
  status: FriendshipStatus.pending,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makePrisma = (
  overrides: {
    friendship?: {
      findUnique?: jest.Mock;
      create?: jest.Mock;
      update?: jest.Mock;
      delete?: jest.Mock;
      findMany?: jest.Mock;
      upsert?: jest.Mock;
    };
  } = {},
) => ({
  friendship: {
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue(makeRow()),
    update: jest.fn().mockResolvedValue(makeRow({ status: FriendshipStatus.accepted })),
    delete: jest.fn().mockResolvedValue(makeRow()),
    findMany: jest.fn().mockResolvedValue([]),
    upsert: jest.fn().mockResolvedValue(makeRow()),
    ...overrides.friendship,
  },
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FriendshipService', () => {
  let service: FriendshipService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    prisma = makePrisma();
    service = new FriendshipService(prisma as never);
  });

  // ─── sendRequest ─────────────────────────────────────────────────────────

  describe('sendRequest', () => {
    it('(a) happy path: creates pending friendship with canonical ordering', async () => {
      // initiator=user-zzz, target=user-aaa → requesterId=user-aaa (min), addresseeId=user-zzz
      prisma.friendship.findUnique.mockResolvedValue(null);
      prisma.friendship.create.mockResolvedValue(
        makeRow({ requesterId: 'user-aaa', addresseeId: 'user-zzz', initiatorId: 'user-zzz' }),
      );

      const result = await service.sendRequest('user-zzz', 'user-aaa');

      expect(prisma.friendship.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            requesterId: 'user-aaa',
            addresseeId: 'user-zzz',
            initiatorId: 'user-zzz',
            status: FriendshipStatus.pending,
          }),
        }),
      );
      expect(result.status).toBe(FriendshipStatus.pending);
    });

    it('(b) self-request → BadRequestException', async () => {
      await expect(service.sendRequest('user-aaa', 'user-aaa')).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.friendship.create).not.toHaveBeenCalled();
    });

    it('(c) idempotent: existing pending → returns existing row (no duplicate)', async () => {
      const existing = makeRow({ status: FriendshipStatus.pending, initiatorId: 'user-aaa' });
      prisma.friendship.findUnique.mockResolvedValue(existing);

      const result = await service.sendRequest('user-aaa', 'user-zzz');

      expect(prisma.friendship.create).not.toHaveBeenCalled();
      expect(result).toBe(existing);
    });

    it('(d) existing accepted → idempotent no-op, returns existing', async () => {
      const existing = makeRow({ status: FriendshipStatus.accepted });
      prisma.friendship.findUnique.mockResolvedValue(existing);

      const result = await service.sendRequest('user-aaa', 'user-zzz');

      expect(prisma.friendship.create).not.toHaveBeenCalled();
      expect(result).toBe(existing);
    });

    it('(e) existing blocked → ForbiddenException (blocked re-request)', async () => {
      const existing = makeRow({ status: FriendshipStatus.blocked });
      prisma.friendship.findUnique.mockResolvedValue(existing);

      await expect(service.sendRequest('user-aaa', 'user-zzz')).rejects.toThrow(ForbiddenException);
    });

    it('(f) direction normalization: requesterId is always min userId', async () => {
      prisma.friendship.findUnique.mockResolvedValue(null);
      prisma.friendship.create.mockResolvedValue(
        makeRow({ requesterId: 'user-aaa', addresseeId: 'user-zzz', initiatorId: 'user-zzz' }),
      );

      await service.sendRequest('user-zzz', 'user-aaa');

      const createCall = (prisma.friendship.create as jest.Mock).mock.calls[0][0] as {
        data: { requesterId: string; addresseeId: string };
      };
      expect(createCall.data.requesterId).toBe('user-aaa');
      expect(createCall.data.addresseeId).toBe('user-zzz');
    });
  });

  // ─── acceptRequest ────────────────────────────────────────────────────────

  describe('acceptRequest', () => {
    it('(a) happy path: non-initiator accepts pending → status becomes accepted', async () => {
      // row: requesterId=user-aaa, addresseeId=user-zzz, initiatorId=user-aaa
      // caller=user-zzz (non-initiator) can accept
      const row = makeRow({
        requesterId: 'user-aaa',
        addresseeId: 'user-zzz',
        initiatorId: 'user-aaa',
        status: FriendshipStatus.pending,
      });
      prisma.friendship.findUnique.mockResolvedValue(row);
      prisma.friendship.update.mockResolvedValue({ ...row, status: FriendshipStatus.accepted });

      const result = await service.acceptRequest('user-zzz', 'user-aaa');

      expect(prisma.friendship.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: FriendshipStatus.accepted },
        }),
      );
      expect(result.status).toBe(FriendshipStatus.accepted);
    });

    it('(b) initiator cannot accept own request → ForbiddenException', async () => {
      const row = makeRow({
        requesterId: 'user-aaa',
        addresseeId: 'user-zzz',
        initiatorId: 'user-aaa',
        status: FriendshipStatus.pending,
      });
      prisma.friendship.findUnique.mockResolvedValue(row);

      // caller=user-aaa is the initiator → should be forbidden
      await expect(service.acceptRequest('user-aaa', 'user-zzz')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('(c) accept already-accepted → ConflictException', async () => {
      const row = makeRow({
        status: FriendshipStatus.accepted,
        initiatorId: 'user-aaa',
      });
      prisma.friendship.findUnique.mockResolvedValue(row);

      await expect(service.acceptRequest('user-zzz', 'user-aaa')).rejects.toThrow(
        ConflictException,
      );
    });

    it('(d) row not found → NotFoundException', async () => {
      prisma.friendship.findUnique.mockResolvedValue(null);

      await expect(service.acceptRequest('user-zzz', 'user-aaa')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── rejectRequest ────────────────────────────────────────────────────────

  describe('rejectRequest', () => {
    it('(a) non-initiator can reject pending → row deleted', async () => {
      const row = makeRow({
        requesterId: 'user-aaa',
        addresseeId: 'user-zzz',
        initiatorId: 'user-aaa',
        status: FriendshipStatus.pending,
      });
      prisma.friendship.findUnique.mockResolvedValue(row);

      await service.rejectRequest('user-zzz', 'user-aaa');

      expect(prisma.friendship.delete).toHaveBeenCalledWith({ where: { id: 'fs-1' } });
    });

    it('(b) reject non-pending → ConflictException', async () => {
      const row = makeRow({ status: FriendshipStatus.accepted, initiatorId: 'user-aaa' });
      prisma.friendship.findUnique.mockResolvedValue(row);

      await expect(service.rejectRequest('user-zzz', 'user-aaa')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // ─── cancelRequest ────────────────────────────────────────────────────────

  describe('cancelRequest', () => {
    it('(a) initiator can cancel own pending request → row deleted', async () => {
      const row = makeRow({
        requesterId: 'user-aaa',
        addresseeId: 'user-zzz',
        initiatorId: 'user-aaa',
        status: FriendshipStatus.pending,
      });
      prisma.friendship.findUnique.mockResolvedValue(row);

      await service.cancelRequest('user-aaa', 'user-zzz');

      expect(prisma.friendship.delete).toHaveBeenCalledWith({ where: { id: 'fs-1' } });
    });

    it('(b) non-initiator cannot cancel → ForbiddenException', async () => {
      const row = makeRow({
        requesterId: 'user-aaa',
        addresseeId: 'user-zzz',
        initiatorId: 'user-aaa',
        status: FriendshipStatus.pending,
      });
      prisma.friendship.findUnique.mockResolvedValue(row);

      await expect(service.cancelRequest('user-zzz', 'user-aaa')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('(c) cancelling an accepted friendship → ConflictException (non-pending guard)', async () => {
      const row = makeRow({
        requesterId: 'user-aaa',
        addresseeId: 'user-zzz',
        initiatorId: 'user-aaa',
        status: FriendshipStatus.accepted,
      });
      prisma.friendship.findUnique.mockResolvedValue(row);

      await expect(service.cancelRequest('user-aaa', 'user-zzz')).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.friendship.delete).not.toHaveBeenCalled();
    });
  });

  // ─── blockUser ────────────────────────────────────────────────────────────

  describe('blockUser', () => {
    it('(a) block from accepted friendship → status becomes blocked', async () => {
      const row = makeRow({ status: FriendshipStatus.accepted, initiatorId: 'user-aaa' });
      prisma.friendship.findUnique.mockResolvedValue(row);
      prisma.friendship.update.mockResolvedValue({ ...row, status: FriendshipStatus.blocked });

      const result = await service.blockUser('user-aaa', 'user-zzz');

      expect(result.status).toBe(FriendshipStatus.blocked);
    });

    it('(b) block when no existing friendship → creates blocked row', async () => {
      prisma.friendship.findUnique.mockResolvedValue(null);
      prisma.friendship.upsert.mockResolvedValue(
        makeRow({ status: FriendshipStatus.blocked, initiatorId: 'user-aaa' }),
      );

      const result = await service.blockUser('user-aaa', 'user-zzz');

      expect(result.status).toBe(FriendshipStatus.blocked);
    });
  });

  // ─── listFriends ──────────────────────────────────────────────────────────

  describe('listFriends', () => {
    it('(a) returns ids of accepted friends', async () => {
      prisma.friendship.findMany.mockResolvedValue([
        makeRow({
          requesterId: 'user-aaa',
          addresseeId: 'user-zzz',
          status: FriendshipStatus.accepted,
        }),
        makeRow({
          requesterId: 'user-bbb',
          addresseeId: 'user-aaa',
          status: FriendshipStatus.accepted,
        }),
      ]);

      const result = await service.listFriends('user-aaa');

      // For first row: caller=user-aaa is requester → friend=user-zzz
      // For second row: caller=user-aaa is addressee → friend=user-bbb
      expect(result).toContain('user-zzz');
      expect(result).toContain('user-bbb');
      expect(result).toHaveLength(2);
    });

    it('(b) returns empty array when no accepted friends', async () => {
      prisma.friendship.findMany.mockResolvedValue([]);
      const result = await service.listFriends('user-aaa');
      expect(result).toEqual([]);
    });
  });

  // ─── listPendingRequests ──────────────────────────────────────────────────

  describe('listPendingRequests', () => {
    it('(a) outgoing request: initiatorId === callerId → direction outgoing', async () => {
      // user-aaa initiated → outgoing for user-aaa
      const outboundRow = makeRow({
        requesterId: 'user-aaa',
        addresseeId: 'user-zzz',
        initiatorId: 'user-aaa',
        status: FriendshipStatus.pending,
      });
      prisma.friendship.findMany.mockResolvedValue([outboundRow]);

      const result = await service.listPendingRequests('user-aaa');

      expect(result).toHaveLength(1);
      expect(result.at(0)?.direction).toBe(PENDING_DIRECTION.outgoing);
      expect(result.at(0)?.id).toBe('fs-1');
    });

    it('(b) incoming request: initiatorId !== callerId → direction incoming', async () => {
      // user-zzz initiated → incoming for user-aaa
      const inboundRow = makeRow({
        requesterId: 'user-aaa',
        addresseeId: 'user-zzz',
        initiatorId: 'user-zzz',
        status: FriendshipStatus.pending,
      });
      prisma.friendship.findMany.mockResolvedValue([inboundRow]);

      const result = await service.listPendingRequests('user-aaa');

      expect(result).toHaveLength(1);
      expect(result.at(0)?.direction).toBe(PENDING_DIRECTION.incoming);
    });

    it('(c) both directions returned together with correct labels', async () => {
      const outboundRow = makeRow({
        id: 'fs-out',
        requesterId: 'user-aaa',
        addresseeId: 'user-eee',
        initiatorId: 'user-aaa',
        status: FriendshipStatus.pending,
      });
      const inboundRow = makeRow({
        id: 'fs-in',
        requesterId: 'user-aaa',
        addresseeId: 'user-fff',
        initiatorId: 'user-fff',
        status: FriendshipStatus.pending,
      });
      prisma.friendship.findMany.mockResolvedValue([outboundRow, inboundRow]);

      const result = await service.listPendingRequests('user-aaa');

      expect(result).toHaveLength(2);
      const out = result.find((r) => r.id === 'fs-out');
      const inc = result.find((r) => r.id === 'fs-in');
      expect(out?.direction).toBe(PENDING_DIRECTION.outgoing);
      expect(inc?.direction).toBe(PENDING_DIRECTION.incoming);
    });

    it('(d) returns empty array when no pending requests', async () => {
      prisma.friendship.findMany.mockResolvedValue([]);

      const result = await service.listPendingRequests('user-aaa');

      expect(result).toEqual([]);
    });
  });
});
