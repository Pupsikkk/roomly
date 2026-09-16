import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response } from 'express';
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
export class DomainExceptionFilter implements ExceptionFilter {
  catch(
    exception:
      | UserAlreadyExistsError
      | UserNotFoundError
      | InvalidCredentialsError
      | InvalidRefreshTokenError,
    host: ArgumentsHost,
  ) {
    const response = host.switchToHttp().getResponse<Response>();
    const httpException = this.toHttpException(exception);
    const status = httpException.getStatus();
    const body = httpException.getResponse();

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
