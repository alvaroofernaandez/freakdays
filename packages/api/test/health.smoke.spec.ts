import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../src/common/prisma/prisma.service';
import { HealthService } from '../src/health/health.service';

describe('HealthService smoke', () => {
  it('devuelve status ok con shape estable cuando DB responde', async () => {
    const configService = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;

    const mockPrisma = {
      $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    } as unknown as PrismaService;

    const service = new HealthService(configService, mockPrisma);
    const status = await service.getStatus();

    expect(status.status).toBe('ok');
    expect(status.db).toBe('ok');
    expect(status.service).toBe('freak-days-api');
    expect(typeof status.timestamp).toBe('string');
    expect(typeof status.uptime).toBe('number');
  });

  it('devuelve status degraded cuando DB falla', async () => {
    const configService = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;

    const mockPrisma = {
      $queryRaw: jest.fn().mockRejectedValue(new Error('connection refused')),
    } as unknown as PrismaService;

    const service = new HealthService(configService, mockPrisma);
    const status = await service.getStatus();

    expect(status.status).toBe('degraded');
    expect(status.db).toBe('error');
  });
});
