import { Controller, Get, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Response } from 'express';

import { Public } from '../auth/decorators/public.decorator';
import { MetricsService } from './metrics.service';

/**
 * Exposes GET /api/metrics (global prefix = 'api').
 * No authentication required — scraping is infra-level.
 * Content-Type: text/plain; version=0.0.4 (Prometheus text format).
 *
 * Scrape URL: http://<host>/api/metrics
 */
@ApiExcludeController()
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Public()
  @Get()
  async getMetrics(@Res() res: Response): Promise<void> {
    const body = await this.metricsService.metrics();
    res.setHeader('Content-Type', this.metricsService.contentType);
    res.status(200).send(body);
  }
}
