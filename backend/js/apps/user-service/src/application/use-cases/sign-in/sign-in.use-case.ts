import { Inject, Injectable } from '@nestjs/common';
import { Traced } from '@roomly/common';
import type { SessionTokensResponse } from '@roomly/contracts';
import { InvalidCredentialsError } from '../../../domain';
import { IssueSessionTokensService } from '../../services/issue-session-tokens.service';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../ports/user.repository';
import { PasswordUtils } from '../../utils/password.utils';

export type SignInInput = {
  email: string;
  password: string;
};

@Traced()
@Injectable()
export class SignInUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepository,
    private readonly sessions: IssueSessionTokensService,
  ) {}

  async execute(input: SignInInput): Promise<SessionTokensResponse> {
    const email = input.email.trim().toLowerCase();
    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const ok = await PasswordUtils.compare(input.password, user.passwordHash);
    if (!ok) {
      throw new InvalidCredentialsError();
    }

    return this.sessions.issue(user.id);
  }
}
