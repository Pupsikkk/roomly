import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { recordActiveSpanError } from '@roomly/common';
import { Logger } from 'nestjs-pino';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { toGrpcStatusCode } from './rethrow-as-rpc';

/**
 * Map domain errors → gRPC status for Nest `@GrpcMethod` handlers.
 * Uses `error.name` (not `instanceof`) so webpack duplicate class copies still match.
 */
@Injectable()
export class GrpcDomainErrorInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'rpc') {
      return next.handle();
    }

    return next.handle().pipe(
      catchError((err: unknown) => {
        if (err instanceof RpcException) {
          return throwError(() => err);
        }

        const error =
          err instanceof Error
            ? err
            : new Error(typeof err === 'string' ? err : String(err));
        const code = toGrpcStatusCode(error);
        recordActiveSpanError(error, { 'rpc.grpc.status_code': code });
        this.logger.warn(
          {
            err: { type: error.name, message: error.message },
            grpcCode: code,
          },
          `${error.name}: ${error.message}`,
        );
        return throwError(
          () => new RpcException({ code, message: error.message }),
        );
      }),
    );
  }
}
