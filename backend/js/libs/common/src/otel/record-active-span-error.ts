import { SpanStatusCode, trace } from '@opentelemetry/api';

/**
 * Mark the current span as errored (no-op if tracing is off / no active span).
 */
export function recordActiveSpanError(
  error: unknown,
  attributes?: Record<string, string | number | boolean>,
): void {
  const span = trace.getActiveSpan();
  if (!span) return;

  const err = toError(error);
  span.recordException(err);
  span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
  span.setAttribute('error.type', err.name);

  if (attributes) {
    for (const [key, value] of Object.entries(attributes)) {
      span.setAttribute(key, value);
    }
  }
}

function toError(error: unknown): Error {
  if (error instanceof Error) return error;
  return new Error(typeof error === 'string' ? error : String(error));
}
