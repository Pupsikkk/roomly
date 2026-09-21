import { beforeEach, describe, expect, it } from '@jest/globals';
import { UserAlreadyExistsError } from '../../../domain';
import { FakeEventPublisher } from '../../testing/fake-event-publisher';
import { InMemoryUserRepository } from '../../testing/in-memory-user.repository';
import { stubSessions } from '../../testing/stub-sessions';
import { PasswordUtils } from '../../utils/password.utils';
import { SignUpUseCase } from './sign-up.use-case';

describe('SignUpUseCase', () => {
  let users: InMemoryUserRepository;
  let events: FakeEventPublisher;
  let sessions: ReturnType<typeof stubSessions>;
  let useCase: SignUpUseCase;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    events = new FakeEventPublisher();
    sessions = stubSessions();
    useCase = new SignUpUseCase(users, events, sessions);
  });

  it('creates user, publishes user.created, and issues session tokens', async () => {
    const tokens = await useCase.execute({
      email: 'Ada@Roomly.test',
      password: 'Secret123!',
    });

    const saved = await users.findByEmail('ada@roomly.test');
    expect(saved).not.toBeNull();
    expect(saved!.email).toBe('ada@roomly.test');
    expect(
      await PasswordUtils.compare('Secret123!', saved!.passwordHash),
    ).toBe(true);

    expect(events.published).toEqual([
      { id: saved!.id, email: 'ada@roomly.test' },
    ]);

    expect(sessions.issued).toEqual([
      { userId: saved!.id, familyId: undefined },
    ]);
    expect(tokens.accessToken).toBe(`access.${saved!.id}`);
    expect(tokens.refreshToken).toBe(`refresh.${saved!.id}`);
  });

  it('normalizes email (trim + lowercase) before save', async () => {
    await useCase.execute({
      email: '  Bob@Example.COM  ',
      password: 'Secret123!',
    });

    expect(await users.findByEmail('bob@example.com')).not.toBeNull();
    expect(await users.findByEmail('  Bob@Example.COM  ')).not.toBeNull();
  });

  it('rejects duplicate email and does not publish or issue tokens', async () => {
    await useCase.execute({
      email: 'same@roomly.test',
      password: 'Secret123!',
    });
    events.published.length = 0;
    sessions.issued.length = 0;

    await expect(
      useCase.execute({
        email: 'SAME@roomly.test',
        password: 'OtherPass1!',
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);

    expect(events.published).toHaveLength(0);
    expect(sessions.issued).toHaveLength(0);
  });
});
