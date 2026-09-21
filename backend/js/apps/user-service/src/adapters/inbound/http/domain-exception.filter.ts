import { status as grpcStatus } from '@grpc/grpc-js';
import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { recordActiveSpanError } from '@roomly/common';
import type { Response } from 'express';
import { Logger } from 'nestjs-pino';
import { Observable, throwError } from 'rxjs';
import {
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  UserAlreadyExistsError,
  UserNotFoundError,
} from '../../../domain';

@Catch(
  UserAlreadyExistsError,
  UserNotFoundError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
)
@Injectable()
export class DomainExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(
    exception:
      | UserAlreadyExistsError
      | UserNotFoundError
      | InvalidCredentialsError
      | InvalidRefreshTokenError,
    host: ArgumentsHost,
  ): void | Observable<never> {
    // Hybrid app: same APP_FILTER stack serves gRPC — serialize to { code, message }.
    if (host.getType() !== 'http') {
      return throwError(() => ({
        code: toGrpcStatusCode(exception),
        message: exception.message,
      }));
    }

    const response = host.switchToHttp().getResponse<Response>();
    const httpException = this.toHttpException(exception);
    const status = httpException.getStatus();
    const body = httpException.getResponse();

    recordActiveSpanError(exception, {
      'http.response.status_code': status,
    });

    // Expected domain failures → warn (still correlated via pino OTel mixin).
    this.logger.warn(
      {
        err: {
          type: exception.name,
          message: exception.message,
        },
        statusCode: status,
      },
      `${exception.name}: ${exception.message}`,
    );

    response.status(status).json(
      typeof body === 'string'
        ? { statusCode: status, message: body }
        : body,
    );
  }

  private toHttpException(exception: Error): HttpException {
    if (exception instanceof UserAlreadyExistsError) {
      return new ConflictException(exception.message);
    }
    if (
      exception instanceof InvalidCredentialsError ||
      exception instanceof InvalidRefreshTokenError
    ) {
      return new UnauthorizedException(exception.message);
    }
    if (exception instanceof UserNotFoundError) {
      return new NotFoundException(exception.message);
    }
    return new NotFoundException(exception.message);
  }
}

function toGrpcStatusCode(exception: Error): number {
  switch (exception.name) {
    case 'UserAlreadyExistsError':
      return grpcStatus.ALREADY_EXISTS;
    case 'InvalidCredentialsError':
    case 'InvalidRefreshTokenError':
      return grpcStatus.UNAUTHENTICATED;
    case 'UserNotFoundError':
      return grpcStatus.NOT_FOUND;
    default:
      return grpcStatus.INTERNAL;
  }
}
