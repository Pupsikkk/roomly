import { Inject, Injectable } from '@nestjs/common';
import { userCreatedEvent } from '@roomly/contracts';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { User, UserAlreadyExistsError } from '../../domain/index';
import {
  EVENT_PUBLISHER,
  type EventPublisher,
} from '../ports/event-publisher.port';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../ports/user.repository';

export type CreateUserInput = {
  email: string;
  password: string;
};

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepository,
    @Inject(EVENT_PUBLISHER)
    private readonly events: EventPublisher,
  ) {}

  async execute(input: CreateUserInput): Promise<User> {
    const email = input.email.trim().toLowerCase();
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new UserAlreadyExistsError(email);
    }

    const now = new Date();
    const user = new User({
      id: randomUUID(),
      email,
      passwordHash: await bcrypt.hash(input.password, 10),
      createdAt: now,
      updatedAt: now,
    });

    const saved = await this.users.save(user);

    await this.events.publish(
      userCreatedEvent({ id: saved.id, email: saved.email }),
    );

    return saved;
  }
}
