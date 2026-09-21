import { Inject, Injectable } from '@nestjs/common';
import { Traced } from '@roomly/common';
import type { SessionTokensResponse } from '@roomly/contracts';
import { InvalidRefreshTokenError } from '../../../domain';
import {
  REFRESH_TOKEN_STORE,
  type RefreshTokenStorePort,
} from '../../ports/refresh-token.store';
import { IssueSessionTokensService } from '../../services/issue-session-tokens.service';

export type RefreshSessionInput = {
  refreshToken: string;
};

@Traced()
@Injectable()
export class RefreshSessionUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_STORE)
    private readonly refreshTokens: RefreshTokenStorePort,
    private readonly sessions: IssueSessionTokensService,
  ) {}

  async execute(input: RefreshSessionInput): Promise<SessionTokensResponse> {
    const record = await this.refreshTokens.take(input.refreshToken);
    if (!record) {
      throw new InvalidRefreshTokenError();
    }

    return this.sessions.issue(record.userId, record.familyId);
  }
}
