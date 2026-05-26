import { Global, Module } from '@nestjs/common';

import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

/**
 * @Global() so MetricsService is available project-wide without
 * explicit imports. EventsModule (processor + relay) injects it
 * with @Optional() to stay decoupled.
 */
@Global()
@Module({
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class ObservabilityModule {}
