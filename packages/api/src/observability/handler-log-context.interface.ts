export interface HandlerLogContext {
  readonly handler: string;
  readonly eventType: string;
  readonly eventId: string;
  readonly durationMs: number;
  readonly success: boolean;
  readonly skipped?: boolean;
  readonly error?: string;
}
