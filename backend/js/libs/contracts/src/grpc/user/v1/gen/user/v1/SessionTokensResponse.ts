// Original file: libs/contracts/src/grpc/user/v1/user.proto

import type { Long } from '@grpc/proto-loader';

export interface SessionTokensResponse {
  'accessToken'?: (string);
  'refreshToken'?: (string);
  'accessExpiresIn'?: (number);
  'refreshExpiresIn'?: (number);
  'accessExp'?: (number | string | Long);
}

export interface SessionTokensResponse__Output {
  'accessToken': (string);
  'refreshToken': (string);
  'accessExpiresIn': (number);
  'refreshExpiresIn': (number);
  'accessExp': (string);
}
