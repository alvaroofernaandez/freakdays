/**
 * Boot smoke test — validates that AppModule compiles and app.init() completes
 * with zero DI errors.
 *
 * This test is the regression guard for NestJS DI wiring issues. It must be
 * part of the default `pnpm --filter freak-days-api test` run so CI catches
 * future module-wiring regressions automatically.
 *
 * Overrides that are required and why:
 *
 *   PrismaService — its onModuleInit() calls $connect(), which requires a live
 *   database. We override it with a no-op to keep the test infrastructure-free.
 *   The DI graph is fully validated regardless; we are NOT mocking the graph,
 *   only the side-effecting lifecycle hook.
 *
 *   GamificationModule seeds achievements in onModuleInit() via PrismaService.
 *   Since PrismaService is already mocked, no additional override is needed —
 *   the seeding calls will target the mock (which returns undefined/void by
 *   default and does not throw).
 */

import { Test, type TestingModule } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';

describe('AppModule boot smoke', () => {
  let moduleRef: TestingModule;
  let app: INestApplication;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        // onModuleInit is replaced so no real DB connection is attempted
        onModuleInit: jest.fn().mockResolvedValue(undefined),
        $connect: jest.fn().mockResolvedValue(undefined),
        $disconnect: jest.fn().mockResolvedValue(undefined),
        // Seeding calls used in GamificationModule.onModuleInit()
        achievement: {
          upsert: jest.fn().mockResolvedValue({}),
        },
        // Stub remaining Prisma methods accessed during init
        partyMember: { findMany: jest.fn().mockResolvedValue([]) },
        $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
      })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('compiles AppModule and boots without DI errors', () => {
    expect(app).toBeDefined();
  });
});
