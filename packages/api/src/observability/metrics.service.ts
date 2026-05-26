import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import type { HandlerLogContext } from './handler-log-context.interface';
import { createMetricsRegistry, type MetricsRegistryBundle } from './metrics.registry';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly logger = new Logger(MetricsService.name);
  private bundle!: MetricsRegistryBundle;

  onModuleInit(): void {
    this.bundle = createMetricsRegistry();
  }

  /**
   * Record a handler invocation result from a HandlerLogContext.
   * Fire-and-forget: a metrics failure MUST NOT affect event processing.
   */
  recordHandler(ctx: HandlerLogContext): void {
    try {
      const outcome = ctx.skipped === true ? 'skipped' : ctx.success ? 'success' : 'error';
      this.bundle.counter.inc({
        handler: ctx.handler,
        eventType: ctx.eventType,
        outcome,
      });
    } catch (err: unknown) {
      this.logger.warn(`MetricsService.recordHandler failed — ${String(err)}`);
    }
  }

  /**
   * Record handler processing duration in milliseconds.
   * Fire-and-forget.
   */
  observeDuration(handler: string, eventType: string, ms: number): void {
    try {
      this.bundle.histogram.observe({ handler, eventType }, ms);
    } catch (err: unknown) {
      this.logger.warn(`MetricsService.observeDuration failed — ${String(err)}`);
    }
  }

  /**
   * Set the current outbox backlog count.
   * Fire-and-forget.
   */
  setOutboxBacklog(n: number): void {
    try {
      this.bundle.gauge.set(n);
    } catch (err: unknown) {
      this.logger.warn(`MetricsService.setOutboxBacklog failed — ${String(err)}`);
    }
  }

  /**
   * Return the Prometheus text exposition format.
   */
  async metrics(): Promise<string> {
    return this.bundle.registry.metrics();
  }

  /**
   * Content-Type header value for the /metrics scrape endpoint.
   */
  get contentType(): string {
    return this.bundle.registry.contentType;
  }
}
