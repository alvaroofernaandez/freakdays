import type { HandlerLogContext } from '../handler-log-context.interface';

describe('HandlerLogContext interface shape', () => {
  it('accepts a valid success context with all required fields', () => {
    const ctx: HandlerLogContext = {
      handler: 'feed-projector',
      eventType: 'quest.completed',
      eventId: 'evt-abc-123',
      durationMs: 42,
      success: true,
    };

    expect(ctx.handler).toBe('feed-projector');
    expect(ctx.eventType).toBe('quest.completed');
    expect(ctx.eventId).toBe('evt-abc-123');
    expect(ctx.durationMs).toBe(42);
    expect(ctx.success).toBe(true);
    expect(ctx.skipped).toBeUndefined();
    expect(ctx.error).toBeUndefined();
  });

  it('accepts an error context with the optional error field', () => {
    const ctx: HandlerLogContext = {
      handler: 'stats-projector',
      eventType: 'level.up',
      eventId: 'evt-xyz-456',
      durationMs: 5,
      success: false,
      error: 'Transient DB error',
    };

    expect(ctx.success).toBe(false);
    expect(ctx.error).toBe('Transient DB error');
    expect(ctx.skipped).toBeUndefined();
  });

  it('accepts a skipped (dedup) context with the optional skipped field', () => {
    const ctx: HandlerLogContext = {
      handler: 'streak-handler',
      eventType: 'daily.login',
      eventId: 'evt-dedup-789',
      durationMs: 1,
      success: true,
      skipped: true,
    };

    expect(ctx.skipped).toBe(true);
    expect(ctx.error).toBeUndefined();
  });

  it('durationMs must be a non-negative number', () => {
    const ctx: HandlerLogContext = {
      handler: 'h',
      eventType: 't',
      eventId: 'e',
      durationMs: 0,
      success: true,
    };

    expect(ctx.durationMs).toBeGreaterThanOrEqual(0);
  });
});
