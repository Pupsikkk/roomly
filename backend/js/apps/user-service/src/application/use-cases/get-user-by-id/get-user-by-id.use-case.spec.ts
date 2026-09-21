import { beforeEach, describe, expect, it } from '@jest/globals';
import { UserNotFoundError } from '../../../domain';
import { InMemoryUserRepository } from '../../testing/in-memory-user.repository';
import { seedUser } from '../../testing/seed-user';
import { GetUserByIdUseCase } from './get-user-by-id.use-case';

describe('GetUserByIdUseCase', () => {
  let users: InMemoryUserRepository;
  let useCase: GetUserByIdUseCase;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    useCase = new GetUserByIdUseCase(users);
  });

  it('returns user by id', async () => {
    const saved = await seedUser(users, {
      email: 'ada@roomly.test',
      password: 'Secret123!',
      id: 'user-42',
    });

    const found = await useCase.execute('user-42');
    expect(found).toBe(saved);
    expect(found.email).toBe('ada@roomly.test');
  });

  it('throws when user does not exist', async () => {
    await expect(useCase.execute('missing')).rejects.toBeInstanceOf(
      UserNotFoundError,
    );
  });
});
