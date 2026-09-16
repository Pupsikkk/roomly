import { Module } from '@nestjs/common';
import { JwtDenylistModule } from '@roomly/infra';
import { REFRESH_TOKEN_STORE } from '../../../application/ports/refresh-token.store';
import { TOKEN_DENYLIST } from '../../../application/ports/token-denylist.port';
import { TOKEN_SIGNER } from '../../../application/ports/token-signer.port';
import { IssueSessionTokensService } from '../../../application/services/issue-session-tokens.service';
import { RedisAdapterModule } from '../redis/redis.module';
import { RedisRefreshTokenStore } from './redis-refresh-token.store';
import { RedisTokenDenylist } from './redis-token.denylist';
import { RsaJwtTokenSigner } from './rsa-jwt.token-signer';

@Module({
  imports: [JwtDenylistModule.forRoot(), RedisAdapterModule],
  providers: [
    RsaJwtTokenSigner,
    RedisTokenDenylist,
    RedisRefreshTokenStore,
    IssueSessionTokensService,
    {
      provide: TOKEN_SIGNER,
      useExisting: RsaJwtTokenSigner,
    },
    {
      provide: TOKEN_DENYLIST,
      useExisting: RedisTokenDenylist,
    },
    {
      provide: REFRESH_TOKEN_STORE,
      useExisting: RedisRefreshTokenStore,
    },
  ],
  exports: [
    TOKEN_SIGNER,
    TOKEN_DENYLIST,
    REFRESH_TOKEN_STORE,
    IssueSessionTokensService,
  ],
})
export class AuthModule {}
