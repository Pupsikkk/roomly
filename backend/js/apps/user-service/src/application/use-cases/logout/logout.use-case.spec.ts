import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { FakeTokenDenylist } from '../../testing/fake-token-denylist';
import { InMemoryRefreshTokenStore } from '../../testing/in-memory-refresh-token.store';
import { LogoutUseCase } from './logout.use-case';

describe('LogoutUseCase', () => {
  let denylist: FakeTokenDenylist;
  let refreshTokens: InMemoryRefreshTokenStore;
  let useCase: LogoutUseCase;

  beforeEach(() => {
    denylist = new FakeTokenDenylist();
    refreshTokens = new InMemoryRefreshTokenStore();
    useCase = new LogoutUseCase(denylist, refreshTokens);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('revokes access jti for remaining TTL and deletes refresh token', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_000_000_000_000); // → 1_000_000_000 s
    await refreshTokens.save(
      'refresh-abc',
      { userId: 'u1', familyId: 'f1' },
      3600,
    );

    await useCase.execute({
      jti: 'jti-1',
      exp: 1_000_000_000 + 120,
      refreshToken: 'refresh-abc',
    });

    expect(denylist.revocations).toEqual([{ jti: 'jti-1', ttlSeconds: 120 }]);
    expect(await denylist.isRevoked('jti-1')).toBe(true);
    expect(refreshTokens.has('refresh-abc')).toBe(false);
  });

  it('skips denylist when jti or exp is missing', async () => {
    await useCase.execute({ refreshToken: 'only-refresh' });
    expect(denylist.revocations).toHaveLength(0);
  });

  it('skips refresh revoke when refreshToken is omitted', async () => {
    await refreshTokens.save(
      'keep-me',
      { userId: 'u1', familyId: 'f1' },
      3600,
    );

    await useCase.execute({
      jti: 'jti-2',
      exp: Math.floor(Date.now() / 1000) + 60,
    });

    expect(denylist.revocations).toHaveLength(1);
    expect(refreshTokens.has('keep-me')).toBe(true);
  });
});
