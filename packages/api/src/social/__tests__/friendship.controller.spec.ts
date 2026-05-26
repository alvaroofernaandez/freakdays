import { BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { FriendshipStatus } from '@prisma/client';
import type { Request } from 'express';
import { FriendshipController } from '../friendship.controller';
import { FriendshipService } from '../friendship.service';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mockRequest = (sub: string): Partial<Request> => ({
  user: { sub } as Request['user'],
});

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

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FriendshipController', () => {
  let controller: FriendshipController;
  let service: jest.Mocked<FriendshipService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FriendshipController],
      providers: [
        {
          provide: FriendshipService,
          useValue: {
            sendRequest: jest.fn(),
            acceptRequest: jest.fn(),
            rejectRequest: jest.fn(),
            cancelRequest: jest.fn(),
            blockUser: jest.fn(),
            listFriends: jest.fn(),
            listIncomingRequests: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(FriendshipController);
    service = module.get(FriendshipService);
  });

  describe('POST /v1/friends/requests (sendRequest)', () => {
    it('(a) returns 201 created friendship on happy path', async () => {
      const row = makeRow();
      service.sendRequest.mockResolvedValue(row as never);
      const req = mockRequest('user-zzz');

      const result = await controller.sendRequest(req as Request, { targetUserId: 'user-aaa' });

      expect(service.sendRequest).toHaveBeenCalledWith('user-zzz', 'user-aaa');
      expect(result).toBe(row);
    });

    it('(b) passes BadRequestException on self-request through', async () => {
      service.sendRequest.mockRejectedValue(new BadRequestException('Cannot send to yourself'));
      const req = mockRequest('user-aaa');

      await expect(
        controller.sendRequest(req as Request, { targetUserId: 'user-aaa' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('POST /v1/friends/requests/:userId/accept', () => {
    it('(a) returns accepted friendship on happy path', async () => {
      const row = makeRow({ status: FriendshipStatus.accepted });
      service.acceptRequest.mockResolvedValue(row as never);
      const req = mockRequest('user-zzz');

      const result = await controller.acceptRequest(req as Request, 'user-aaa');

      expect(service.acceptRequest).toHaveBeenCalledWith('user-zzz', 'user-aaa');
      expect(result.status).toBe(FriendshipStatus.accepted);
    });

    it('(b) returns 403 when initiator tries to accept own request', async () => {
      service.acceptRequest.mockRejectedValue(
        new ForbiddenException('Only non-initiator can accept'),
      );
      const req = mockRequest('user-aaa');

      await expect(controller.acceptRequest(req as Request, 'user-zzz')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('(c) returns 409 on re-accept of already-accepted friendship', async () => {
      service.acceptRequest.mockRejectedValue(new ConflictException('Already accepted'));
      const req = mockRequest('user-zzz');

      await expect(controller.acceptRequest(req as Request, 'user-aaa')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('POST /v1/friends/requests/:userId/reject', () => {
    it('(a) rejects pending request', async () => {
      service.rejectRequest.mockResolvedValue(undefined);
      const req = mockRequest('user-zzz');

      await controller.rejectRequest(req as Request, 'user-aaa');

      expect(service.rejectRequest).toHaveBeenCalledWith('user-zzz', 'user-aaa');
    });
  });

  describe('DELETE /v1/friends/requests/:userId (cancelRequest)', () => {
    it('(a) cancels own pending request', async () => {
      service.cancelRequest.mockResolvedValue(undefined);
      const req = mockRequest('user-aaa');

      await controller.cancelRequest(req as Request, 'user-zzz');

      expect(service.cancelRequest).toHaveBeenCalledWith('user-aaa', 'user-zzz');
    });
  });

  describe('GET /v1/friends (listFriends)', () => {
    it('(a) returns list of friend ids', async () => {
      service.listFriends.mockResolvedValue(['user-bbb', 'user-ccc']);
      const req = mockRequest('user-aaa');

      const result = await controller.listFriends(req as Request);

      expect(service.listFriends).toHaveBeenCalledWith('user-aaa');
      expect(result).toEqual(['user-bbb', 'user-ccc']);
    });
  });

  describe('GET /v1/friends/requests/incoming', () => {
    it('(a) returns incoming pending requests', async () => {
      const rows = [makeRow({ initiatorId: 'user-zzz' })];
      service.listIncomingRequests.mockResolvedValue(rows as never);
      const req = mockRequest('user-aaa');

      const result = await controller.listIncomingRequests(req as Request);

      expect(service.listIncomingRequests).toHaveBeenCalledWith('user-aaa');
      expect(result).toBe(rows);
    });
  });
});
