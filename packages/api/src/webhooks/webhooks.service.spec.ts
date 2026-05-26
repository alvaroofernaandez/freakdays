import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'node:crypto';

import { PrismaService } from '../common/prisma/prisma.service';
import { WebhooksService } from './webhooks.service';

// Helpers to build a valid Svix-signed payload for tests that need to
// reach the business logic past signature verification.
const WEBHOOK_SECRET_BASE64 = Buffer.from('test-secret-32-bytes-padding!!').toString('base64');
const WEBHOOK_SECRET_WITH_PREFIX = `whsec_${WEBHOOK_SECRET_BASE64}`;

function buildValidHeaders(
  svixId: string,
  payload: string,
): {
  svixId: string;
  svixTimestamp: string;
  svixSignature: string;
} {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const secret = Buffer.from(WEBHOOK_SECRET_BASE64, 'base64');
  const toSign = `${svixId}.${timestamp}.${payload}`;
  const sig = createHmac('sha256', secret).update(toSign).digest('base64');

  return {
    svixId,
    svixTimestamp: timestamp,
    svixSignature: `v1,${sig}`,
  };
}

describe('WebhooksService', () => {
  let service: WebhooksService;
  let mockConfigService: jest.Mocked<Pick<ConfigService, 'get'>>;
  let mockPrisma: {
    user: {
      upsert: jest.Mock;
      findUnique: jest.Mock;
      updateMany: jest.Mock;
    };
    organization: {
      upsert: jest.Mock;
      findUnique: jest.Mock;
      updateMany: jest.Mock;
    };
    membership: {
      upsert: jest.Mock;
      deleteMany: jest.Mock;
    };
    profile: {
      upsert: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockConfigService = {
      get: jest.fn().mockReturnValue(WEBHOOK_SECRET_WITH_PREFIX),
    };

    const upsertedUser = { id: 'u1', clerkUserId: 'clerk_user_1' };
    const upsertedOrg = { id: 'o1', clerkOrgId: 'org_1' };

    mockPrisma = {
      user: {
        upsert: jest.fn().mockResolvedValue(upsertedUser),
        findUnique: jest.fn().mockResolvedValue(upsertedUser),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      organization: {
        upsert: jest.fn().mockResolvedValue(upsertedOrg),
        findUnique: jest.fn().mockResolvedValue(null), // no slug collision by default
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      membership: {
        upsert: jest.fn().mockResolvedValue({}),
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      profile: {
        upsert: jest.fn().mockResolvedValue({}),
      },
      $transaction: jest.fn().mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => {
        // Run the transaction callback with the mock prisma itself as the tx client.
        return cb(mockPrisma);
      }),
    };

    service = new WebhooksService(
      mockConfigService as unknown as ConfigService,
      mockPrisma as unknown as PrismaService,
    );
  });

  describe('verifySvixSignature', () => {
    it('throws BadRequestException when svix-id header is missing', async () => {
      const payload = JSON.stringify({ type: 'user.created', data: {} });

      await expect(
        service.processClerkWebhook(payload, {
          svixId: undefined,
          svixTimestamp: '12345',
          svixSignature: 'v1,abc',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws UnauthorizedException when signature does not match', async () => {
      const payload = JSON.stringify({ type: 'user.created', data: { id: 'clerk_user_1' } });
      const timestamp = Math.floor(Date.now() / 1000).toString();

      await expect(
        service.processClerkWebhook(payload, {
          svixId: 'msg_1',
          svixTimestamp: timestamp,
          svixSignature: 'v1,invalidsignature',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when timestamp is outside 5-minute tolerance', async () => {
      const payload = JSON.stringify({ type: 'user.created', data: { id: 'clerk_user_1' } });
      const staleTimestamp = (Math.floor(Date.now() / 1000) - 400).toString(); // 400s ago
      const secret = Buffer.from(WEBHOOK_SECRET_BASE64, 'base64');
      const toSign = `msg_stale.${staleTimestamp}.${payload}`;
      const sig = createHmac('sha256', secret).update(toSign).digest('base64');

      await expect(
        service.processClerkWebhook(payload, {
          svixId: 'msg_stale',
          svixTimestamp: staleTimestamp,
          svixSignature: `v1,${sig}`,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('handleUserUpsert (user.created / user.updated)', () => {
    it('upserts user when payload is valid', async () => {
      const payload = JSON.stringify({
        type: 'user.created',
        data: {
          id: 'clerk_user_1',
          email_addresses: [{ id: 'em_1', email_address: 'test@example.com' }],
          primary_email_address_id: 'em_1',
          first_name: 'Alice',
          last_name: 'Smith',
        },
      });

      const headers = buildValidHeaders('msg_uc', payload);
      await service.processClerkWebhook(payload, headers);

      expect(mockPrisma.user.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { clerkUserId: 'clerk_user_1' },
          create: expect.objectContaining({
            clerkUserId: 'clerk_user_1',
            email: 'test@example.com',
            isActive: true,
          }),
        }),
      );
    });

    it('populates Profile.displayName and Profile.avatarUrl from Clerk on user.created', async () => {
      const payload = JSON.stringify({
        type: 'user.created',
        data: {
          id: 'clerk_user_1',
          email_addresses: [{ id: 'em_1', email_address: 'alice@example.com' }],
          primary_email_address_id: 'em_1',
          first_name: 'Alice',
          last_name: 'Smith',
          image_url: 'https://img.clerk.com/alice.jpg',
          username: 'alicesmith',
        },
      });

      const headers = buildValidHeaders('msg_uc2', payload);
      await service.processClerkWebhook(payload, headers);

      expect(mockPrisma.profile.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'u1' },
          create: expect.objectContaining({
            userId: 'u1',
            displayName: 'Alice Smith',
            avatarUrl: 'https://img.clerk.com/alice.jpg',
          }),
        }),
      );
    });

    it('populates Profile.displayName from Clerk username when first/last name are absent', async () => {
      const payload = JSON.stringify({
        type: 'user.created',
        data: {
          id: 'clerk_user_2',
          email_addresses: [],
          image_url: null,
          username: 'bobbuilder',
        },
      });

      mockPrisma.user.upsert.mockResolvedValue({ id: 'u2', clerkUserId: 'clerk_user_2' });

      const headers = buildValidHeaders('msg_uc3', payload);
      await service.processClerkWebhook(payload, headers);

      expect(mockPrisma.profile.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'u2' },
          create: expect.objectContaining({
            userId: 'u2',
            displayName: 'bobbuilder',
            avatarUrl: null,
          }),
        }),
      );
    });

    it('does NOT overwrite Profile.displayName or avatarUrl on update (fill-when-null)', async () => {
      const payload = JSON.stringify({
        type: 'user.updated',
        data: {
          id: 'clerk_user_1',
          email_addresses: [{ id: 'em_1', email_address: 'alice@example.com' }],
          primary_email_address_id: 'em_1',
          first_name: 'Alice',
          last_name: 'Smith',
          image_url: 'https://img.clerk.com/alice-new.jpg',
        },
      });

      const headers = buildValidHeaders('msg_uu', payload);
      await service.processClerkWebhook(payload, headers);

      expect(mockPrisma.profile.upsert).toHaveBeenCalled();

      // The update clause must use a Prisma raw expression or no-op, NOT a plain string,
      // so that already-set values are preserved. We verify displayName and avatarUrl
      // in the update arg are NOT plain string values (they must be conditional SQL expressions).
      const call = mockPrisma.profile.upsert.mock.calls[0] as [
        {
          where: Record<string, unknown>;
          create: Record<string, unknown>;
          update: Record<string, unknown>;
        },
      ];
      const { update } = call[0];

      // displayName and avatarUrl must not be raw strings in update — they use
      // Prisma.sql coalesce to only fill when null.
      expect(typeof update['displayName']).not.toBe('string');
      expect(typeof update['avatarUrl']).not.toBe('string');
    });

    it('is idempotent — calling user.created twice does not throw', async () => {
      const payload = JSON.stringify({
        type: 'user.created',
        data: {
          id: 'clerk_user_1',
          email_addresses: [{ id: 'em_1', email_address: 'alice@example.com' }],
          primary_email_address_id: 'em_1',
          first_name: 'Alice',
          last_name: 'Smith',
          image_url: 'https://img.clerk.com/alice.jpg',
        },
      });

      const headers1 = buildValidHeaders('msg_idem1', payload);
      const headers2 = buildValidHeaders('msg_idem2', payload);

      await expect(service.processClerkWebhook(payload, headers1)).resolves.toBeUndefined();
      await expect(service.processClerkWebhook(payload, headers2)).resolves.toBeUndefined();

      expect(mockPrisma.profile.upsert).toHaveBeenCalledTimes(2);
    });
  });

  describe('handleUserDeleted (user.deleted)', () => {
    it('marks user as inactive via updateMany', async () => {
      const payload = JSON.stringify({
        type: 'user.deleted',
        data: { id: 'clerk_user_1' },
      });

      const headers = buildValidHeaders('msg_ud', payload);
      await service.processClerkWebhook(payload, headers);

      expect(mockPrisma.user.updateMany).toHaveBeenCalledWith({
        where: { clerkUserId: 'clerk_user_1' },
        data: { isActive: false },
      });
    });
  });

  describe('resolveUniqueOrganizationSlug', () => {
    it('generates a suffixed slug on collision', async () => {
      // First call: slug "my-org" is taken by a different org.
      // Second call: "my-org-2" is free.
      mockPrisma.organization.findUnique
        .mockResolvedValueOnce({ clerkOrgId: 'OTHER_ORG' }) // "my-org" taken
        .mockResolvedValueOnce(null); // "my-org-2" free

      const payload = JSON.stringify({
        type: 'organization.created',
        data: { id: 'org_new', name: 'My Org', slug: 'my-org' },
      });

      const headers = buildValidHeaders('msg_oc', payload);
      await service.processClerkWebhook(payload, headers);

      expect(mockPrisma.organization.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            slug: 'my-org-2',
          }),
        }),
      );
    });

    it('keeps the base slug when there is no collision', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue(null); // no collision

      const payload = JSON.stringify({
        type: 'organization.created',
        data: { id: 'org_free', name: 'Free Org', slug: 'free-org' },
      });

      const headers = buildValidHeaders('msg_oc2', payload);
      await service.processClerkWebhook(payload, headers);

      expect(mockPrisma.organization.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            slug: 'free-org',
          }),
        }),
      );
    });
  });
});
