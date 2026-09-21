// Original file: libs/contracts/src/grpc/user/v1/user.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { GetUserByIdRequest as _user_v1_GetUserByIdRequest, GetUserByIdRequest__Output as _user_v1_GetUserByIdRequest__Output } from '../../user/v1/GetUserByIdRequest';
import type { UserResponse as _user_v1_UserResponse, UserResponse__Output as _user_v1_UserResponse__Output } from '../../user/v1/UserResponse';

export interface UserServiceClient extends grpc.Client {
  GetUserById(argument: _user_v1_GetUserByIdRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_user_v1_UserResponse__Output>): grpc.ClientUnaryCall;
  GetUserById(argument: _user_v1_GetUserByIdRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_user_v1_UserResponse__Output>): grpc.ClientUnaryCall;
  GetUserById(argument: _user_v1_GetUserByIdRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_user_v1_UserResponse__Output>): grpc.ClientUnaryCall;
  GetUserById(argument: _user_v1_GetUserByIdRequest, callback: grpc.requestCallback<_user_v1_UserResponse__Output>): grpc.ClientUnaryCall;
  getUserById(argument: _user_v1_GetUserByIdRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_user_v1_UserResponse__Output>): grpc.ClientUnaryCall;
  getUserById(argument: _user_v1_GetUserByIdRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_user_v1_UserResponse__Output>): grpc.ClientUnaryCall;
  getUserById(argument: _user_v1_GetUserByIdRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_user_v1_UserResponse__Output>): grpc.ClientUnaryCall;
  getUserById(argument: _user_v1_GetUserByIdRequest, callback: grpc.requestCallback<_user_v1_UserResponse__Output>): grpc.ClientUnaryCall;
  
}

export interface UserServiceHandlers extends grpc.UntypedServiceImplementation {
  GetUserById: grpc.handleUnaryCall<_user_v1_GetUserByIdRequest__Output, _user_v1_UserResponse>;
  
}

export interface UserServiceDefinition extends grpc.ServiceDefinition {
  GetUserById: MethodDefinition<_user_v1_GetUserByIdRequest, _user_v1_UserResponse, _user_v1_GetUserByIdRequest__Output, _user_v1_UserResponse__Output>
}
