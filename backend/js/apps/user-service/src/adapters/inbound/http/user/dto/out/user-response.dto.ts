import type { UserResponse } from '@roomly/contracts';
import type { User } from '../../../../../../domain/user';

export class UserResponseDto implements UserResponse {
  id!: string;
  email!: string;
  createdAt!: string;
  updatedAt!: string;

  static fromDomain(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
