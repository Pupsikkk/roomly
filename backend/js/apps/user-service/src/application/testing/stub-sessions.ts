import type { SessionTokens } from '../dto/session-tokens';
import type { IssueSessionTokensService } from '../services/issue-session-tokens.service';

export type StubSessions = IssueSessionTokensService & {
  issued: { userId: string; familyId?: string }[];
};

/** Records issue() calls; returns deterministic token strings. */
export function stubSessions(): StubSessions {
  const issued: { userId: string; familyId?: string }[] = [];
  return {
    issued,
    async issue(
      userId: string,
      familyId?: string,
    ): Promise<SessionTokens> {
      issued.push({ userId, familyId });
      return {
        accessToken: `access.${userId}`,
        refreshToken: `refresh.${userId}`,
        accessExpiresIn: 900,
        refreshExpiresIn: 2_592_000,
        accessExp: Math.floor(Date.now() / 1000) + 900,
      };
    },
  } as StubSessions;
}
