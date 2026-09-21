/** Issued access + refresh session (application result, not HTTP/gRPC DTO). */
export type SessionTokens = {
  accessToken: string;
  refreshToken: string;
  /** Access TTL in seconds */
  accessExpiresIn: number;
  /** Refresh TTL in seconds */
  refreshExpiresIn: number;
  /** Access exp (unix seconds) */
  accessExp: number;
};
