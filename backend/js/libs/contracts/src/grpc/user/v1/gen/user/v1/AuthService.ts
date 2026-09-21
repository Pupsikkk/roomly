// Original file: libs/contracts/src/grpc/user/v1/user.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { LogoutRequest as _user_v1_LogoutRequest, LogoutRequest__Output as _user_v1_LogoutRequest__Output } from '../../user/v1/LogoutRequest';
import type { LogoutResponse as _user_v1_LogoutResponse, LogoutResponse__Output as _user_v1_LogoutResponse__Output } from '../../user/v1/LogoutResponse';
import type { RefreshRequest as _user_v1_RefreshRequest, RefreshRequest__Output as _user_v1_RefreshRequest__Output } from '../../user/v1/RefreshRequest';
import type { SessionTokensResponse as _user_v1_SessionTokensResponse, SessionTokensResponse__Output as _user_v1_SessionTokensResponse__Output } from '../../user/v1/SessionTokensResponse';
import type { SignInRequest as _user_v1_SignInRequest, SignInRequest__Output as _user_v1_SignInRequest__Output } from '../../user/v1/SignInRequest';
import type { SignUpRequest as _user_v1_SignUpRequest, SignUpRequest__Output as _user_v1_SignUpRequest__Output } from '../../user/v1/SignUpRequest';

export interface AuthServiceClient extends grpc.Client {
  Logout(argument: _user_v1_LogoutRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_user_v1_LogoutResponse__Output>): grpc.ClientUnaryCall;
  Logout(argument: _user_v1_LogoutRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_user_v1_LogoutResponse__Output>): grpc.ClientUnaryCall;
  Logout(argument: _user_v1_LogoutRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_user_v1_LogoutResponse__Output>): grpc.ClientUnaryCall;
  Logout(argument: _user_v1_LogoutRequest, callback: grpc.requestCallback<_user_v1_LogoutResponse__Output>): grpc.ClientUnaryCall;
  logout(argument: _user_v1_LogoutRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_user_v1_LogoutResponse__Output>): grpc.ClientUnaryCall;
  logout(argument: _user_v1_LogoutRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_user_v1_LogoutResponse__Output>): grpc.ClientUnaryCall;
  logout(argument: _user_v1_LogoutRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_user_v1_LogoutResponse__Output>): grpc.ClientUnaryCall;
  logout(argument: _user_v1_LogoutRequest, callback: grpc.requestCallback<_user_v1_LogoutResponse__Output>): grpc.ClientUnaryCall;
  
  Refresh(argument: _user_v1_RefreshRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_user_v1_SessionTokensResponse__Output>): grpc.ClientUnaryCall;
  Refresh(argument: _user_v1_RefreshRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_user_v1_SessionTokensResponse__Output>): grpc.ClientUnaryCall;
  Refresh(argument: _user_v1_RefreshRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_user_v1_SessionTokensResponse__Output>): grpc.ClientUnaryCall;
  Refresh(argument: _user_v1_RefreshRequest, callback: grpc.requestCallback<_user_v1_SessionTokensResponse__Output>): grpc.ClientUnaryCall;
  refresh(argument: _user_v1_RefreshRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_user_v1_SessionTokensResponse__Output>): grpc.ClientUnaryCall;
  refresh(argument: _user_v1_RefreshRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_user_v1_SessionTokensResponse__Output>): grpc.ClientUnaryCall;
  refresh(argument: _user_v1_RefreshRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_user_v1_SessionTokensResponse__Output>): grpc.ClientUnaryCall;
  refresh(argument: _user_v1_RefreshRequest, callback: grpc.requestCallback<_user_v1_SessionTokensResponse__Output>): grpc.ClientUnaryCall;
  
  SignIn(argument: _user_v1_SignInRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_user_v1_SessionTokensResponse__Output>): grpc.ClientUnaryCall;
  SignIn(argument: _user_v1_SignInRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_user_v1_SessionTokensResponse__Output>): grpc.ClientUnaryCall;
  SignIn(argument: _user_v1_SignInRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_user_v1_SessionTokensResponse__Output>): grpc.ClientUnaryCall;
  SignIn(argument: _user_v1_SignInRequest, callback: grpc.requestCallback<_user_v1_SessionTokensResponse__Output>): grpc.ClientUnaryCall;
  signIn(argument: _user_v1_SignInRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_user_v1_SessionTokensResponse__Output>): grpc.ClientUnaryCall;
  signIn(argument: _user_v1_SignInRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_user_v1_SessionTokensResponse__Output>): grpc.ClientUnaryCall;
  signIn(argument: _user_v1_SignInRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_user_v1_SessionTokensResponse__Output>): grpc.ClientUnaryCall;
  signIn(argument: _user_v1_SignInRequest, callback: grpc.requestCallback<_user_v1_SessionTokensResponse__Output>): grpc.ClientUnaryCall;
  
  SignUp(argument: _user_v1_SignUpRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_user_v1_SessionTokensResponse__Output>): grpc.ClientUnaryCall;
  SignUp(argument: _user_v1_SignUpRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_user_v1_SessionTokensResponse__Output>): grpc.ClientUnaryCall;
  SignUp(argument: _user_v1_SignUpRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_user_v1_SessionTokensResponse__Output>): grpc.ClientUnaryCall;
  SignUp(argument: _user_v1_SignUpRequest, callback: grpc.requestCallback<_user_v1_SessionTokensResponse__Output>): grpc.ClientUnaryCall;
  signUp(argument: _user_v1_SignUpRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_user_v1_SessionTokensResponse__Output>): grpc.ClientUnaryCall;
  signUp(argument: _user_v1_SignUpRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_user_v1_SessionTokensResponse__Output>): grpc.ClientUnaryCall;
  signUp(argument: _user_v1_SignUpRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_user_v1_SessionTokensResponse__Output>): grpc.ClientUnaryCall;
  signUp(argument: _user_v1_SignUpRequest, callback: grpc.requestCallback<_user_v1_SessionTokensResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface AuthServiceHandlers extends grpc.UntypedServiceImplementation {
  Logout: grpc.handleUnaryCall<_user_v1_LogoutRequest__Output, _user_v1_LogoutResponse>;
  
  Refresh: grpc.handleUnaryCall<_user_v1_RefreshRequest__Output, _user_v1_SessionTokensResponse>;
  
  SignIn: grpc.handleUnaryCall<_user_v1_SignInRequest__Output, _user_v1_SessionTokensResponse>;
  
  SignUp: grpc.handleUnaryCall<_user_v1_SignUpRequest__Output, _user_v1_SessionTokensResponse>;
  
}

export interface AuthServiceDefinition extends grpc.ServiceDefinition {
  Logout: MethodDefinition<_user_v1_LogoutRequest, _user_v1_LogoutResponse, _user_v1_LogoutRequest__Output, _user_v1_LogoutResponse__Output>
  Refresh: MethodDefinition<_user_v1_RefreshRequest, _user_v1_SessionTokensResponse, _user_v1_RefreshRequest__Output, _user_v1_SessionTokensResponse__Output>
  SignIn: MethodDefinition<_user_v1_SignInRequest, _user_v1_SessionTokensResponse, _user_v1_SignInRequest__Output, _user_v1_SessionTokensResponse__Output>
  SignUp: MethodDefinition<_user_v1_SignUpRequest, _user_v1_SessionTokensResponse, _user_v1_SignUpRequest__Output, _user_v1_SessionTokensResponse__Output>
}
