import { join } from 'node:path';
import type { Observable } from 'rxjs';
import type { GetUserByIdRequest } from './gen/user/v1/GetUserByIdRequest';
import type { LogoutRequest } from './gen/user/v1/LogoutRequest';
import type { LogoutResponse } from './gen/user/v1/LogoutResponse';
import type { RefreshRequest } from './gen/user/v1/RefreshRequest';
import type { SessionTokensResponse } from './gen/user/v1/SessionTokensResponse';
import type { SignInRequest } from './gen/user/v1/SignInRequest';
import type { SignUpRequest } from './gen/user/v1/SignUpRequest';
import type { UserResponse } from './gen/user/v1/UserResponse';

/** Must match `package` in user.proto */
export const PACKAGE = 'user.v1';

/** Absolute proto path for Nest Transport.GRPC / ClientsModule */
export function protoPath(): string {
  const fromEnv = process.env.USER_SERVICE_PROTO_PATH?.trim();
  if (fromEnv) return fromEnv;
  return join(
    process.cwd(),
    'libs/contracts/src/grpc/user/v1/user.proto',
  );
}

export type {
  GetUserByIdRequest,
  LogoutRequest,
  LogoutResponse,
  RefreshRequest,
  SessionTokensResponse,
  SignInRequest,
  SignUpRequest,
  UserResponse,
};

/** Nest `ClientGrpc.getService('AuthService')` */
export type AuthService = {
  signUp(data: SignUpRequest): Observable<SessionTokensResponse>;
  signIn(data: SignInRequest): Observable<SessionTokensResponse>;
  refresh(data: RefreshRequest): Observable<SessionTokensResponse>;
  logout(data: LogoutRequest): Observable<LogoutResponse>;
};

/** Nest `ClientGrpc.getService('UserService')` */
export type UserService = {
  getUserById(data: GetUserByIdRequest): Observable<UserResponse>;
};

/**
 * Nest `@GrpcMethod` handlers for AuthService.
 * Not the generated `AuthServiceHandlers` (those are raw grpc-js callbacks).
 */
export type AuthServiceController = {
  signUp(data: SignUpRequest): Promise<SessionTokensResponse>;
  signIn(data: SignInRequest): Promise<SessionTokensResponse>;
  refresh(data: RefreshRequest): Promise<SessionTokensResponse>;
  logout(data: LogoutRequest): Promise<LogoutResponse>;
};

/** Nest `@GrpcMethod` handlers for UserService */
export type UserServiceController = {
  getUserById(data: GetUserByIdRequest): Promise<UserResponse>;
};
