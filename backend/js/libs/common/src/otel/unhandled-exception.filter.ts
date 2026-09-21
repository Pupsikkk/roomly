import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { isSpanContextValid, trace } from '@opentelemetry/api';
import type { Response } from 'express';
import { Logger } from 'nestjs-pino';
import { Observable, throwError } from 'rxjs';
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
 * Serialize an exception for the gRPC transport.
 *
 * Hybrid apps share APP_FILTER with microservices (`inheritAppConfig`).
 * Re-throwing here skips Nest's BaseRpcExceptionFilter, so grpc-js receives
 * a bare Error without `.code` and maps it to UNKNOWN (2).
 */
function toGrpcErrorPayload(exception: unknown): object {
  if (exception instanceof RpcException) {
    const res = exception.getError();
    if (res !== null && typeof res === 'object') {
      return res;
    }
    return { code: 2, message: String(res) };
  }

  // GrpcException (and similar) expose getError() → { code, message }.
  if (
    exception instanceof Error &&
    'getError' in exception &&
    typeof (exception as { getError: unknown }).getError === 'function'
  ) {
    const body = (exception as { getError: () => unknown }).getError();
    if (body !== null && typeof body === 'object') {
      return body;
    }
  }

  // Plain object / Error that already carries a numeric gRPC code.
  if (
    exception !== null &&
    typeof exception === 'object' &&
    typeof (exception as { code?: unknown }).code === 'number'
  ) {
    return exception as object;
  }

  const message =
    exception instanceof Error
      ? exception.message
      : typeof exception === 'string'
        ? exception
        : 'Internal server error';
  return { code: 13, message }; // INTERNAL
}

/**
 * Catch-all for unexpected failures (and HTTP 5xx).
 * Domain / business filters should be registered after this so they run first.
 */
@Catch()
@Injectable()
export class UnhandledExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(
    exception: unknown,
    host: ArgumentsHost,
  ): void | Observable<never> {
    // Hybrid Nest apps share APP_FILTER with gRPC — must return an Observable
    // with a `{ code, message }` payload, not rethrow a bare Error.
    if (host.getType() !== 'http') {
      return throwError(() => toGrpcErrorPayload(exception));
    }

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
