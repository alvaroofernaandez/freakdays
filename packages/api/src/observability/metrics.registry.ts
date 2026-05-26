import { Counter, Gauge, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

export interface MetricsRegistryBundle {
  readonly registry: Registry;
  readonly counter: Counter<'handler' | 'eventType' | 'outcome'>;
  readonly histogram: Histogram<'handler' | 'eventType'>;
  readonly gauge: Gauge;
}

/**
 * Creates an isolated prom-client Registry with the 3 F5 metrics.
 * Calling this factory once per application bootstrap (wired via MetricsService)
 * returns a single bundle. Using a factory (not module-level singletons) keeps
 * tests isolated — each spec call gets its own Registry with no cross-pollution.
 */
export function createMetricsRegistry(): MetricsRegistryBundle {
  const registry = new Registry();

  collectDefaultMetrics({ register: registry });

  const counter = new Counter<'handler' | 'eventType' | 'outcome'>({
    name: 'domain_event_processing_total',
    help: 'Total domain events processed, labelled by handler, eventType and outcome',
    labelNames: ['handler', 'eventType', 'outcome'],
    registers: [registry],
  });

  const histogram = new Histogram<'handler' | 'eventType'>({
    name: 'domain_event_processing_duration_ms',
    help: 'Domain event handler processing duration in milliseconds',
    labelNames: ['handler', 'eventType'],
    buckets: [5, 10, 25, 50, 100, 250, 500, 1000],
    registers: [registry],
  });

  const gauge = new Gauge({
    name: 'outbox_backlog',
    help: 'Number of pending outbox events awaiting relay',
    registers: [registry],
  });

  return { registry, counter, histogram, gauge };
}
