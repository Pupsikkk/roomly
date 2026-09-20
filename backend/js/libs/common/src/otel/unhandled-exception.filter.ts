import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { isSpanContextValid, trace } from '@opentelemetry/api';
import type { Response } from 'express';
import { Logger } from 'nestjs-pino';
import { recordActiveSpanError } from './record-active-span-error';
import { TRACE_ID_HEADER } from './trace-id.interceptor';

function activeTraceId(): string | undefined {
  const span = trace.getActiveSpan();
  if (!span) return undefined;
  const ctx = span.spanContext();
  return isSpanContextValid(ctx) ? ctx.traceId : undefined;
}

function withTraceId<T extends Record<string, unknown>>(
  body: T,
): T & { traceId?: string } {
  const traceId = activeTraceId();
  return traceId ? { ...body, traceId } : body;
}

/**
 * Catch-all for unexpected failures (and HTTP 5xx).
 * Domain / business filters should be registered after this so they run first.
 */
@Catch()
@Injectable()
export class UnhandledExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const traceId = activeTraceId();
    if (traceId && !response.getHeader(TRACE_ID_HEADER)) {
      response.setHeader(TRACE_ID_HEADER, traceId);
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();

      if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        recordActiveSpanError(exception, {
          'http.response.status_code': status,
        });
        this.logger.error(
          {
            err: {
              type: exception.name,
              message: exception.message,
            },
            statusCode: status,
          },
          `HttpException ${status}: ${exception.message}`,
        );
      }

      const payload =
        typeof body === 'string'
          ? { statusCode: status, message: body }
          : typeof body === 'object' && body !== null
            ? (body as Record<string, unknown>)
            : { statusCode: status, message: String(body) };

      response.status(status).json(withTraceId(payload));
      return;
    }

    recordActiveSpanError(exception, {
      'http.response.status_code': HttpStatus.INTERNAL_SERVER_ERROR,
    });

    const err =
      exception instanceof Error
        ? exception
        : new Error(typeof exception === 'string' ? exception : String(exception));

    this.logger.error(
      {
        err: {
          type: err.name,
          message: err.message,
          stack: err.stack,
        },
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      },
      `Unhandled exception: ${err.message}`,
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      withTraceId({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      }),
    );
  }
}
