import { Inject, Injectable } from '@nestjs/common';
import {
  REFRESH_TOKEN_STORE,
  type RefreshTokenStorePort,
} from '../ports/refresh-token.store';
import {
  TOKEN_DENYLIST,
  type TokenDenylistPort,
} from '../ports/token-denylist.port';

export type LogoutInput = {
  jti?: string;
  exp?: number;
  refreshToken?: string;
};

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(TOKEN_DENYLIST)
    private readonly denylist: TokenDenylistPort,
    @Inject(REFRESH_TOKEN_STORE)
    private readonly refreshTokens: RefreshTokenStorePort,
  ) {}

  async execute(input: LogoutInput): Promise<void> {
    if (input.jti && typeof input.exp === 'number') {
      const now = Math.floor(Date.now() / 1000);
      await this.denylist.revoke(input.jti, input.exp - now);
    }

    if (input.refreshToken) {
      await this.refreshTokens.revoke(input.refreshToken);
    }
  }
}
