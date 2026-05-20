import { Controller, Get, HttpCode, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { Public } from '../auth/decorators/public.decorator';
import { HealthService, type HealthStatus } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @HttpCode(200)
  @Get()
  async getHealth(@Res() res: Response): Promise<void> {
    const status = await this.healthService.getStatus();
    const httpStatus = status.db === 'error' ? 503 : 200;
    res.status(httpStatus).json(status);
  }
}
