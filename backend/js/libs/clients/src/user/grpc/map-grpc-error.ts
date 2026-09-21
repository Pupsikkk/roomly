import { status } from '@grpc/grpc-js';
import {
  ConflictException,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

const GRPC_CODE_BY_NAME: Record<string, number> = {
  OK: status.OK,
  CANCELLED: status.CANCELLED,
  UNKNOWN: status.UNKNOWN,
  INVALID_ARGUMENT: status.INVALID_ARGUMENT,
  NOT_FOUND: status.NOT_FOUND,
  ALREADY_EXISTS: status.ALREADY_EXISTS,
  PERMISSION_DENIED: status.PERMISSION_DENIED,
  UNAUTHENTICATED: status.UNAUTHENTICATED,
  INTERNAL: status.INTERNAL,
  UNAVAILABLE: status.UNAVAILABLE,
};

function readCode(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const asNum = Number(value);
    if (!Number.isNaN(asNum)) return asNum;
    return GRPC_CODE_BY_NAME[value];
  }
  return undefined;
}

function grpcStatusCode(err: unknown): number | undefined {
  if (!err || typeof err !== 'object') return undefined;
  const e = err as Record<string, unknown>;

  const direct = readCode(e.code);
  if (direct !== undefined) return direct;

  if (e.error && typeof e.error === 'object') {
    const nested = grpcStatusCode(e.error);
    if (nested !== undefined) return nested;
  }

  if (e.status && typeof e.status === 'object') {
    const fromStatus = readCode((e.status as { code?: unknown }).code);
    if (fromStatus !== undefined) return fromStatus;
  }

  const msg = String(e.details ?? e.message ?? '');
  const prefixed = msg.match(/^(\d+)\s+([A-Z_]+)/);
  if (prefixed) {
    const byNum = Number(prefixed[1]);
    if (!Number.isNaN(byNum)) return byNum;
    return GRPC_CODE_BY_NAME[prefixed[2]];
  }

  for (const [name, code] of Object.entries(GRPC_CODE_BY_NAME)) {
    if (name !== 'OK' && msg.includes(name)) return code;
  }

  return undefined;
}

function errorMessage(err: unknown): string {
  if (!err || typeof err !== 'object') {
    return 'user-service gRPC error';
  }
  const e = err as { details?: string; message?: string };
  const raw = e.details || e.message || 'user-service gRPC error';
  // Strip "6 ALREADY_EXISTS: " prefix from grpc-js messages when present.
  return raw.replace(/^\d+\s+[A-Z_]+:\s*/, '');
}

/** Map user-service gRPC status → Nest HTTP exceptions. */
export function mapUserServiceGrpcError(err: unknown): never {
  const message = errorMessage(err);
  switch (grpcStatusCode(err)) {
    case status.ALREADY_EXISTS:
      throw new ConflictException(message);
    case status.UNAUTHENTICATED:
      throw new UnauthorizedException(message);
    case status.NOT_FOUND:
      throw new NotFoundException(message);
    case status.INVALID_ARGUMENT:
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    default:
      throw new HttpException(message, HttpStatus.BAD_GATEWAY);
  }
}
