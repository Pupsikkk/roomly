// Original file: libs/contracts/src/grpc/user/v1/user.proto

import type { Long } from '@grpc/proto-loader';

export interface LogoutRequest {
  'jti'?: (string);
  'exp'?: (number | string | Long);
  'refreshToken'?: (string);
  'hasExp'?: (boolean);
}

export interface LogoutRequest__Output {
  'jti': (string);
  'exp': (string);
  'refreshToken': (string);
  'hasExp': (boolean);
}
