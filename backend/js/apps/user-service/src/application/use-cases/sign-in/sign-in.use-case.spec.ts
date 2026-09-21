import { beforeEach, describe, expect, it } from '@jest/globals';
import { InvalidCredentialsError } from '../../../domain';
import { InMemoryUserRepository } from '../../testing/in-memory-user.repository';
import { seedUser } from '../../testing/seed-user';
import { stubSessions } from '../../testing/stub-sessions';
import { SignInUseCase } from './sign-in.use-case';

describe('SignInUseCase', () => {
  let users: InMemoryUserRepository;
  let sessions: ReturnType<typeof stubSessions>;
  let useCase: SignInUseCase;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    sessions = stubSessions();
    useCase = new SignInUseCase(users, sessions);
  });

  it('issues session tokens for valid credentials', async () => {
    const user = await seedUser(users, {
      email: 'Ada@Roomly.test',
      password: 'Secret123!',
    });

    const tokens = await useCase.execute({
      email: '  ada@roomly.test  ',
      password: 'Secret123!',
    });

    expect(sessions.issued).toEqual([{ userId: user.id, familyId: undefined }]);
    expect(tokens.accessToken).toBe(`access.${user.id}`);
    expect(tokens.refreshToken).toBe(`refresh.${user.id}`);
  });

  it('rejects unknown email', async () => {
    await expect(
      useCase.execute({ email: 'missing@roomly.test', password: 'x' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
    expect(sessions.issued).toHaveLength(0);
  });

  it('rejects wrong password', async () => {
    await seedUser(users, {
      email: 'user@roomly.test',
      password: 'Secret123!',
    });

    await expect(
      useCase.execute({
        email: 'user@roomly.test',
        password: 'WrongPass1!',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
    expect(sessions.issued).toHaveLength(0);
  });
});
