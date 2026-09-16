import type { CookieOptions, Response } from 'express';
import {
  AUTH_COOKIE_NAMES,
  type SessionTokensResponse,
} from '@roomly/contracts';
import type { GatewayConfig } from '@roomly/common';

export function setAuthCookies(
  res: Response,
  tokens: SessionTokensResponse,
  gateway: GatewayConfig,
): void {
  const base = cookieBase(gateway);

  res.cookie(AUTH_COOKIE_NAMES.access, tokens.accessToken, {
    ...base,
    maxAge: tokens.accessExpiresIn * 1000,
    path: '/',
  });

  res.cookie(AUTH_COOKIE_NAMES.refresh, tokens.refreshToken, {
    ...base,
    maxAge: tokens.refreshExpiresIn * 1000,
    // Only sent to auth endpoints (refresh / logout)
    path: '/auth',
  });
}

export function clearAuthCookies(
  res: Response,
  gateway: GatewayConfig,
): void {
  const base = cookieBase(gateway);
  res.clearCookie(AUTH_COOKIE_NAMES.access, { ...base, path: '/' });
  res.clearCookie(AUTH_COOKIE_NAMES.refresh, { ...base, path: '/auth' });
}

function cookieBase(gateway: GatewayConfig): CookieOptions {
  return {
    httpOnly: true,
    secure: gateway.cookieSecure,
    sameSite: gateway.cookieSameSite,
  };
}
