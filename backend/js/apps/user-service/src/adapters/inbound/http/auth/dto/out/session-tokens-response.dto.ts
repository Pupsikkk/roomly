import type { SessionTokensResponse } from '@roomly/contracts';

export class SessionTokensResponseDto {
  static create(tokens: SessionTokensResponse): SessionTokensResponse {
    return tokens;
  }
}
