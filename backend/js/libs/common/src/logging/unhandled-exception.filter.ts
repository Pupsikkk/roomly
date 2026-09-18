import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Response } from 'express';
import { Logger } from 'nestjs-pino';
import { recordActiveSpanError } from '../tracing/record-active-span-error';

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

      response.status(status).json(
        typeof body === 'string'
          ? { statusCode: status, message: body }
          : body,
      );
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

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}
