import { Injectable } from '@nestjs/common';
import type { SessionTokensResponse } from '@roomly/contracts';
import { CreateUserUseCase } from './create-user.use-case';
import { IssueSessionTokensService } from '../services/issue-session-tokens.service';

export type SignUpInput = {
  email: string;
  password: string;
};

@Injectable()
export class SignUpUseCase {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly sessions: IssueSessionTokensService,
  ) {}

  async execute(input: SignUpInput): Promise<SessionTokensResponse> {
    const user = await this.createUser.execute(input);
    return this.sessions.issue(user.id);
  }
}
