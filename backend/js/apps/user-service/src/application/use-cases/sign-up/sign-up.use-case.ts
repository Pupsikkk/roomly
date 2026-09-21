import { Inject, Injectable } from '@nestjs/common';
import { Traced, withSpan } from '@roomly/common';
import { userCreatedEvent, type SessionTokensResponse } from '@roomly/contracts';
import { IssueSessionTokensService } from '../../services/issue-session-tokens.service';
import {
  EVENT_PUBLISHER,
  type EventPublisher,
} from '../../ports/event-publisher.port';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../ports/user.repository';
import { randomUUID } from 'node:crypto';
import { User, UserAlreadyExistsError } from '../../../domain';
import { PasswordUtils } from '../../utils/password.utils';

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

  async execute(input: SignUpInput): Promise<SessionTokensResponse> {
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

    await this.events.publish(
      userCreatedEvent({ id: saved.id, email: saved.email }),
    );

    return this.sessions.issue(saved.id);
  }
}
