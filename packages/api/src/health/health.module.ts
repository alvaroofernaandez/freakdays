import { Module } from '@nestjs/common';

import { CommonModule } from '../common/common.module';
import { AuthHealthController } from './auth-health.controller';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [CommonModule],
  controllers: [HealthController, AuthHealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
