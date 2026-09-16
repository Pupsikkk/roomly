import { Inject, Injectable } from '@nestjs/common';
import { User, UserNotFoundError } from '../../domain/index';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../ports/user.repository';

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepository,
  ) {}

  async execute(id: string): Promise<User> {
    const user = await this.users.findById(id);
    if (!user) {
      throw new UserNotFoundError(id);
    }
    return user;
  }
}
