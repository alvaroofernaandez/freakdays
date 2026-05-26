/**
 * RED phase: tests fail until metrics.registry.ts is created.
 * Verifies that the isolated Registry exposes the 3 required metrics
 * and that metrics() returns a prometheus text string containing those names.
 */

// prom-client is mocked so this suite runs without the real lib installed.
// Once prom-client is installed the mock is replaced by the real module —
// the assertions remain valid in both modes.
jest.mock('prom-client', () => {
  const registries: Set<MockRegistry> = new Set();

  class MockCounter {
    private readonly _name: string;
    private readonly _reg: MockRegistry;
    private readonly _counts: Map<string, number> = new Map();

    constructor(opts: {
      name: string;
      help: string;
      labelNames: string[];
      registers: MockRegistry[];
    }) {
      this._name = opts.name;
      this._reg = opts.registers[0]!;
      opts.registers.forEach((r) => r._registerMetric(this));
    }

    inc(labels: Record<string, string> = {}, value = 1): void {
      const key = JSON.stringify(labels);
      this._counts.set(key, (this._counts.get(key) ?? 0) + value);
    }

    _getName(): string {
      return this._name;
    }

    async _getText(): Promise<string> {
      return `# TYPE ${this._name} counter\n${this._name} 0\n`;
    }
  }

  class MockHistogram {
    private readonly _name: string;

    constructor(opts: {
      name: string;
      help: string;
      labelNames: string[];
      buckets: number[];
      registers: MockRegistry[];
    }) {
      this._name = opts.name;
      opts.registers.forEach((r) => r._registerMetric(this));
    }

    observe(_labels: Record<string, string>, _value: number): void {
      /* no-op */
    }

    _getName(): string {
      return this._name;
    }

    async _getText(): Promise<string> {
      return `# TYPE ${this._name} histogram\n${this._name}_count 0\n`;
    }
  }

  class MockGauge {
    private readonly _name: string;
    private _value = 0;

    constructor(opts: { name: string; help: string; registers: MockRegistry[] }) {
      this._name = opts.name;
      opts.registers.forEach((r) => r._registerMetric(this));
    }

    set(value: number): void {
      this._value = value;
    }

    _getName(): string {
      return this._name;
    }

    async _getText(): Promise<string> {
      return `# TYPE ${this._name} gauge\n${this._name} ${this._value}\n`;
    }
  }

  class MockRegistry {
    private readonly _metrics: Map<
      string,
      { _getName: () => string; _getText: () => Promise<string> }
    > = new Map();

    _registerMetric(m: { _getName: () => string; _getText: () => Promise<string> }): void {
      this._metrics.set(m._getName(), m);
    }

    async metrics(): Promise<string> {
      const parts: string[] = [];
      for (const m of this._metrics.values()) {
        parts.push(await m._getText());
      }
      return parts.join('\n');
    }

    get contentType(): string {
      return 'text/plain; version=0.0.4; charset=utf-8';
    }
  }

  return {
    Registry: MockRegistry,
    Counter: MockCounter,
    Histogram: MockHistogram,
    Gauge: MockGauge,
    collectDefaultMetrics: jest.fn(),
  };
});

import { createMetricsRegistry } from '../metrics.registry';

describe('MetricsRegistry', () => {
  it('exposes domain_event_processing_total counter', () => {
    const { counter } = createMetricsRegistry();
    expect(counter).toBeDefined();
  });

  it('exposes domain_event_processing_duration_ms histogram', () => {
    const { histogram } = createMetricsRegistry();
    expect(histogram).toBeDefined();
  });

  it('exposes outbox_backlog gauge', () => {
    const { gauge } = createMetricsRegistry();
    expect(gauge).toBeDefined();
  });

  it('metrics() returns a string containing all metric names', async () => {
    const { registry } = createMetricsRegistry();
    const text = await registry.metrics();
    expect(typeof text).toBe('string');
    expect(text).toContain('domain_event_processing_total');
    expect(text).toContain('domain_event_processing_duration_ms');
    expect(text).toContain('outbox_backlog');
  });

  it('each call returns a fresh isolated registry (no cross-test pollution)', async () => {
    const a = createMetricsRegistry();
    const b = createMetricsRegistry();
    // Different registry instances
    expect(a.registry).not.toBe(b.registry);
  });
});
