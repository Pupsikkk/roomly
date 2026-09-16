import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  UserAlreadyExistsError,
  UserNotFoundError,
} from '../../../domain';

@Catch(UserAlreadyExistsError, UserNotFoundError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(
    exception: UserAlreadyExistsError | UserNotFoundError,
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
    if (exception instanceof UserNotFoundError) {
      return new NotFoundException(exception.message);
    }
    return new NotFoundException(exception.message);
  }
}
