import { Inject, Injectable } from '@nestjs/common';
import { Traced } from '@roomly/common';
import { User, UserAlreadyExistsError } from '../../../domain';
import type { SessionTokens } from '../../dto/session-tokens';
import {
  EVENT_PUBLISHER,
  type EventPublisher,
} from '../../ports/event-publisher.port';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../ports/user.repository';
import { IssueSessionTokensService } from '../../services/issue-session-tokens.service';
import { PasswordUtils } from '../../utils/password.utils';
import { randomUUID } from 'node:crypto';

export type SignUpInput = {
  email: string;
  password: string;
};

@Traced()
@Injectable()
export class SignUpUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepository,
    @Inject(EVENT_PUBLISHER)
    private readonly events: EventPublisher,
    private readonly sessions: IssueSessionTokensService,
  ) {}

  async execute(input: SignUpInput): Promise<SessionTokens> {
    const email = input.email.trim().toLowerCase();
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new UserAlreadyExistsError(email);
    }

    const now = new Date();
    const passwordHash = await PasswordUtils.hash(input.password);
    const user = new User({
      id: randomUUID(),
      email,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    });

    const saved = await this.users.save(user);

    await this.events.publishUserCreated({
      id: saved.id,
      email: saved.email,
    });

    return this.sessions.issue(saved.id);
  }
}
