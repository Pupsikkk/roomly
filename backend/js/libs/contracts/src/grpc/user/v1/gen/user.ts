import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { AuthServiceClient as _user_v1_AuthServiceClient, AuthServiceDefinition as _user_v1_AuthServiceDefinition } from './user/v1/AuthService';
import type { GetUserByIdRequest as _user_v1_GetUserByIdRequest, GetUserByIdRequest__Output as _user_v1_GetUserByIdRequest__Output } from './user/v1/GetUserByIdRequest';
import type { LogoutRequest as _user_v1_LogoutRequest, LogoutRequest__Output as _user_v1_LogoutRequest__Output } from './user/v1/LogoutRequest';
import type { LogoutResponse as _user_v1_LogoutResponse, LogoutResponse__Output as _user_v1_LogoutResponse__Output } from './user/v1/LogoutResponse';
import type { RefreshRequest as _user_v1_RefreshRequest, RefreshRequest__Output as _user_v1_RefreshRequest__Output } from './user/v1/RefreshRequest';
import type { SessionTokensResponse as _user_v1_SessionTokensResponse, SessionTokensResponse__Output as _user_v1_SessionTokensResponse__Output } from './user/v1/SessionTokensResponse';
import type { SignInRequest as _user_v1_SignInRequest, SignInRequest__Output as _user_v1_SignInRequest__Output } from './user/v1/SignInRequest';
import type { SignUpRequest as _user_v1_SignUpRequest, SignUpRequest__Output as _user_v1_SignUpRequest__Output } from './user/v1/SignUpRequest';
import type { UserResponse as _user_v1_UserResponse, UserResponse__Output as _user_v1_UserResponse__Output } from './user/v1/UserResponse';
import type { UserServiceClient as _user_v1_UserServiceClient, UserServiceDefinition as _user_v1_UserServiceDefinition } from './user/v1/UserService';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  user: {
    v1: {
      AuthService: SubtypeConstructor<typeof grpc.Client, _user_v1_AuthServiceClient> & { service: _user_v1_AuthServiceDefinition }
      GetUserByIdRequest: MessageTypeDefinition<_user_v1_GetUserByIdRequest, _user_v1_GetUserByIdRequest__Output>
      LogoutRequest: MessageTypeDefinition<_user_v1_LogoutRequest, _user_v1_LogoutRequest__Output>
      LogoutResponse: MessageTypeDefinition<_user_v1_LogoutResponse, _user_v1_LogoutResponse__Output>
      RefreshRequest: MessageTypeDefinition<_user_v1_RefreshRequest, _user_v1_RefreshRequest__Output>
      SessionTokensResponse: MessageTypeDefinition<_user_v1_SessionTokensResponse, _user_v1_SessionTokensResponse__Output>
      SignInRequest: MessageTypeDefinition<_user_v1_SignInRequest, _user_v1_SignInRequest__Output>
      SignUpRequest: MessageTypeDefinition<_user_v1_SignUpRequest, _user_v1_SignUpRequest__Output>
      UserResponse: MessageTypeDefinition<_user_v1_UserResponse, _user_v1_UserResponse__Output>
      UserService: SubtypeConstructor<typeof grpc.Client, _user_v1_UserServiceClient> & { service: _user_v1_UserServiceDefinition }
    }
  }
}

