/** HTTP paths related to auth / JWKS (relative to service base URL) */
export const AUTH_HTTP_PATHS = {
  jwks: '.well-known/jwks.json',
  signUp: 'auth/sign-up',
  signIn: 'auth/sign-in',
  refresh: 'auth/refresh',
  logout: 'auth/logout',
} as const;

/** httpOnly cookie names set by the gateway */
export const AUTH_COOKIE_NAMES = {
  access: 'access_token',
  refresh: 'refresh_token',
} as const;

/** Standard JWK Set shape (RFC 7517) */
export type JwksResponse = {
  keys: Jwk[];
};

export type Jwk = {
  kty: string;
  kid?: string;
  use?: string;
  alg?: string;
  n?: string;
  e?: string;
  [param: string]: unknown;
};

/** Access-token claims issued by user-service */
export type AccessTokenClaims = {
  sub: string;
  jti: string;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
};

export type SignUpRequest = {
  email: string;
  password: string;
};

export type SignInRequest = {
  email: string;
  password: string;
};

export type RefreshRequest = {
  refreshToken: string;
};

/**
 * Tokens returned by user-service to the gateway (never to the browser).
 * Gateway stores them in httpOnly cookies.
 */
export type SessionTokensResponse = {
  accessToken: string;
  refreshToken: string;
  /** Access TTL in seconds */
  accessExpiresIn: number;
  /** Refresh TTL in seconds */
  refreshExpiresIn: number;
  /** Access exp (unix seconds) — for denylist / cookie maxAge */
  accessExp: number;
};

/** Public auth response (tokens live in cookies only) */
export type AuthSessionResponse = {
  /** Access-token lifetime in seconds (hint for the client) */
  expiresIn: number;
};

export type LogoutRequest = {
  jti?: string;
  exp?: number;
  refreshToken?: string;
};
