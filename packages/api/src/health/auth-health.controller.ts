import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';

import { Public } from '../auth/decorators/public.decorator';
import { HealthService } from './health.service';

@Controller('v1/health')
export class AuthHealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get('auth')
  getAuthHealth(
    @Req() req: Request,
  ): { status: 'ok' | 'degraded' } | ReturnType<HealthService['getAuthStatus']> {
    const full = this.healthService.getAuthStatus();

    if (req.user) {
      return full;
    }

    return { status: full.status };
  }
}
