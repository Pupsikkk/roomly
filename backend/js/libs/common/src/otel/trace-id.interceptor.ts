import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { isSpanContextValid, trace } from '@opentelemetry/api';
import type { Response } from 'express';
import type { Observable } from 'rxjs';

/** Response header with the active OTel trace id (for SPA / support). */
export const TRACE_ID_HEADER = 'x-trace-id';

/**
 * Sets `x-trace-id` from the active HTTP span so the client can correlate
 * with Tempo / Loki. No-op when OTel is off or there is no valid span.
 */
@Injectable()
export class TraceIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() === 'http') {
      const span = trace.getActiveSpan();
      if (span) {
        const spanCtx = span.spanContext();
        if (isSpanContextValid(spanCtx)) {
          const res = context.switchToHttp().getResponse<Response>();
          if (!res.getHeader(TRACE_ID_HEADER)) {
            res.setHeader(TRACE_ID_HEADER, spanCtx.traceId);
          }
        }
      }
    }
    return next.handle();
  }
}
