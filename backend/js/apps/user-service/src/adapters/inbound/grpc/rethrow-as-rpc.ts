import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';

/** Map domain error names → gRPC status (name-based for webpack-safe matching). */
export function toGrpcStatusCode(error: Error): number {
  switch (error.name) {
    case 'UserAlreadyExistsError':
      return status.ALREADY_EXISTS;
    case 'InvalidCredentialsError':
    case 'InvalidRefreshTokenError':
      return status.UNAUTHENTICATED;
    case 'UserNotFoundError':
      return status.NOT_FOUND;
    default:
      return status.INTERNAL;
  }
}

/**
 * Re-throw as Nest `RpcException` so the gRPC transport gets a real status code.
 * Payload must be `{ code, message }` — grpc-js ignores Errors without a numeric `.code`.
 */
export function rethrowAsRpc(err: unknown): never {
  if (err instanceof RpcException) {
    throw err;
  }
  const error =
    err instanceof Error
      ? err
      : new Error(typeof err === 'string' ? err : String(err));
  throw new RpcException({
    code: toGrpcStatusCode(error),
    message: error.message,
  });
}
