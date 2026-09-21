import { beforeEach, describe, expect, it } from '@jest/globals';
import { InvalidRefreshTokenError } from '../../../domain';
import { InMemoryRefreshTokenStore } from '../../testing/in-memory-refresh-token.store';
import { stubSessions } from '../../testing/stub-sessions';
import { RefreshSessionUseCase } from './refresh-session.use-case';

describe('RefreshSessionUseCase', () => {
  let refreshTokens: InMemoryRefreshTokenStore;
  let sessions: ReturnType<typeof stubSessions>;
  let useCase: RefreshSessionUseCase;

  beforeEach(() => {
    refreshTokens = new InMemoryRefreshTokenStore();
    sessions = stubSessions();
    useCase = new RefreshSessionUseCase(refreshTokens, sessions);
  });

  it('rotates refresh token and issues new session in same family', async () => {
    await refreshTokens.save(
      'raw-refresh',
      { userId: 'user-1', familyId: 'family-9' },
      3600,
    );

    const tokens = await useCase.execute({ refreshToken: 'raw-refresh' });

    expect(refreshTokens.has('raw-refresh')).toBe(false);
    expect(sessions.issued).toEqual([
      { userId: 'user-1', familyId: 'family-9' },
    ]);
    expect(tokens.accessToken).toBe('access.user-1');
  });

  it('rejects unknown or already-used refresh token', async () => {
    await expect(
      useCase.execute({ refreshToken: 'missing' }),
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError);
    expect(sessions.issued).toHaveLength(0);
  });
});
