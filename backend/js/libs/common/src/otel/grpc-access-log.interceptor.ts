import { status as grpcStatus } from '@grpc/grpc-js';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';
import { Observable, tap } from 'rxjs';

type GrpcCallLike = {
  getPath?: () => string;
  getPeer?: () => string;
};

const CLIENT_ERROR_CODES = new Set<number>([
  grpcStatus.INVALID_ARGUMENT,
  grpcStatus.NOT_FOUND,
  grpcStatus.ALREADY_EXISTS,
  grpcStatus.PERMISSION_DENIED,
  grpcStatus.UNAUTHENTICATED,
  grpcStatus.FAILED_PRECONDITION,
  grpcStatus.OUT_OF_RANGE,
  grpcStatus.ABORTED,
]);

/**
 * Access-log equivalent of pino-http for Nest gRPC handlers
 * (pino-http only covers Express).
 */
@Injectable()
export class GrpcAccessLogInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'rpc') {
      return next.handle();
    }

    const started = Date.now();
    const call = context.switchToRpc().getContext<GrpcCallLike>();
    const path =
      typeof call?.getPath === 'function'
        ? call.getPath()
        : `${context.getClass().name}/${context.getHandler().name}`;
    const peer =
      typeof call?.getPeer === 'function' ? call.getPeer() : undefined;

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log(
            {
              req: { rpc: path, peer },
              res: { grpcCode: grpcStatus.OK },
              responseTime: Date.now() - started,
            },
            'request completed',
          );
        },
        error: (err: unknown) => {
          const grpcCode = extractGrpcCode(err) ?? grpcStatus.UNKNOWN;
          const payload = {
            req: { rpc: path, peer },
            res: { grpcCode },
            responseTime: Date.now() - started,
            err: errorSummary(err),
          };
          if (CLIENT_ERROR_CODES.has(grpcCode)) {
            this.logger.warn(payload, 'request errored');
          } else {
            this.logger.error(payload, 'request errored');
          }
        },
      }),
    );
  }
}

function extractGrpcCode(err: unknown): number | undefined {
  if (err instanceof RpcException) {
    const body = err.getError();
    if (typeof body === 'object' && body !== null && 'code' in body) {
      const code = (body as { code?: number | string }).code;
      if (typeof code === 'number') return code;
      if (typeof code === 'string' && code in grpcStatus) {
        return grpcStatus[code as keyof typeof grpcStatus] as number;
      }
    }
  }
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const code = (err as { code?: number }).code;
    if (typeof code === 'number') return code;
  }
  return undefined;
}

function errorSummary(err: unknown): { type: string; message: string } {
  if (err instanceof RpcException) {
    const body = err.getError();
    if (typeof body === 'string') {
      return { type: 'RpcException', message: body };
    }
    if (typeof body === 'object' && body !== null && 'message' in body) {
      return {
        type: err.name,
        message: String((body as { message?: unknown }).message ?? err.message),
      };
    }
    return { type: err.name, message: err.message };
  }
  if (err instanceof Error) {
    return { type: err.name, message: err.message };
  }
  return { type: 'Error', message: String(err) };
}
