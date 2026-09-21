import { registerAs } from '@nestjs/config';
import { DEFAULT_PORTS } from '../constants';
import { env, envInt } from './env';

export interface PostgresConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  userDbName: string;
  hotelDbName: string;
  bookingDbName: string;
}

export interface RedisConfig {
  host: string;
  port: number;
}

export interface RabbitmqConfig {
  host: string;
  port: number;
  user: string;
  password: string;
}

export interface ServicesConfig {
  gatewayPort: number;
  userPort: number;
  notificationPort: number;
  gatewayUrl: string;
  userServiceUrl: string;
  /** Host:port for Nest gRPC clients (gateway → user-service). */
  userServiceGrpcUrl: string;
  /** Bind port for user-service gRPC server (0.0.0.0:port). */
  userServiceGrpcPort: number;
  notificationServiceUrl: string;
  hotelServiceUrl: string;
  bookingServiceUrl: string;
}

/** Shared JWT contract — safe for gateway (verify) and user-service (sign). */
export interface AuthConfig {
  /** JWT `iss` claim */
  jwtIssuer: string;
  /** JWT `aud` claim */
  jwtAudience: string;
  /**
   * JWKS URL for verifiers (gateway).
   * Empty → resolved to `${USER_SERVICE_URL}/.well-known/jwks.json`.
   */
  jwksUri: string;
}

/** Signing secrets — load only in user-service (`authSigning`). */
export interface AuthSigningConfig {
  /** Access-token TTL for jose `setExpirationTime` (e.g. `15m`, `7d`) */
  jwtExpiresIn: string;
  /** Opaque refresh-token TTL (e.g. `30d`) */
  jwtRefreshExpiresIn: string;
  /** `kid` in JWK / JWT header */
  jwtKeyId: string;
  /**
   * PEM private key. Prefer `jwtPrivateKeyPath`.
   * Supports literal `\n` escapes from env.
   */
  jwtPrivateKeyPem: string;
  /** Path to PEM private key file (takes precedence over pem) */
  jwtPrivateKeyPath: string;
}

export interface GatewayConfig {
  /** Comma-separated origins; `*` = reflect any (dev-friendly) */
  corsOrigins: string[];
  /** Rate limit window in milliseconds */
  throttleTtlMs: number;
  /** Max requests per window per IP */
  throttleLimit: number;
  /** httpOnly auth cookies: Secure flag (default: production) */
  cookieSecure: boolean;
  /** SameSite for auth cookies */
  cookieSameSite: 'lax' | 'strict' | 'none';
}

export const postgresConfig = registerAs(
  'postgres',
  (): PostgresConfig => ({
    host: env('POSTGRES_HOST', 'localhost'),
    port: envInt('POSTGRES_PORT', 5432),
    user: env('POSTGRES_USER', 'roomly'),
    password: env('POSTGRES_PASSWORD', 'roomly'),
    userDbName: env('USER_DB_NAME', 'user_db'),
    hotelDbName: env('HOTEL_DB_NAME', 'hotel_db'),
    bookingDbName: env('BOOKING_DB_NAME', 'booking_db'),
  }),
);

export const redisConfig = registerAs(
  'redis',
  (): RedisConfig => ({
    host: env('REDIS_HOST', 'localhost'),
    port: envInt('REDIS_PORT', 6379),
  }),
);

export const rabbitmqConfig = registerAs(
  'rabbitmq',
  (): RabbitmqConfig => ({
    host: env('RABBITMQ_HOST', 'localhost'),
    port: envInt('RABBITMQ_PORT', 5672),
    user: env('RABBITMQ_USER', 'roomly'),
    password: env('RABBITMQ_PASSWORD', 'roomly'),
  }),
);

export const servicesConfig = registerAs(
  'services',
  (): ServicesConfig => {
    const userServiceGrpcPort = envInt('USER_SERVICE_GRPC_PORT', 50051);
    return {
      gatewayPort: envInt('GATEWAY_PORT', DEFAULT_PORTS.gateway),
      userPort: envInt('USER_SERVICE_PORT', DEFAULT_PORTS.user),
      notificationPort: envInt(
        'NOTIFICATION_SERVICE_PORT',
        DEFAULT_PORTS.notification,
      ),
      gatewayUrl: env(
        'GATEWAY_URL',
        `http://localhost:${DEFAULT_PORTS.gateway}`,
      ),
      userServiceUrl: env(
        'USER_SERVICE_URL',
        `http://localhost:${DEFAULT_PORTS.user}`,
      ),
      userServiceGrpcPort,
      userServiceGrpcUrl: env(
        'USER_SERVICE_GRPC_URL',
        `localhost:${userServiceGrpcPort}`,
      ),
      notificationServiceUrl: env(
        'NOTIFICATION_SERVICE_URL',
        `http://localhost:${DEFAULT_PORTS.notification}`,
      ),
      hotelServiceUrl: env('HOTEL_SERVICE_URL', 'http://localhost:8000'),
      bookingServiceUrl: env('BOOKING_SERVICE_URL', 'http://localhost:8001'),
    };
  },
);

export const authConfig = registerAs(
  'auth',
  (): AuthConfig => ({
    jwtIssuer: env('JWT_ISSUER', 'roomly-user-service'),
    jwtAudience: env('JWT_AUDIENCE', 'roomly-gateway'),
    jwksUri: env('JWKS_URI', ''),
  }),
);

export const authSigningConfig = registerAs(
  'authSigning',
  (): AuthSigningConfig => ({
    jwtExpiresIn: env('JWT_EXPIRES_IN', '15m'),
    jwtRefreshExpiresIn: env('JWT_REFRESH_EXPIRES_IN', '30d'),
    jwtKeyId: env('JWT_KEY_ID', 'roomly-dev-1'),
    jwtPrivateKeyPem: env('JWT_PRIVATE_KEY', ''),
    jwtPrivateKeyPath: env('JWT_PRIVATE_KEY_PATH', ''),
  }),
);

export const gatewayConfig = registerAs(
  'gateway',
  (): GatewayConfig => ({
    corsOrigins: env('CORS_ORIGINS', '*')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    throttleTtlMs: envInt('THROTTLE_TTL_MS', 60_000),
    throttleLimit: envInt('THROTTLE_LIMIT', 100),
    cookieSecure:
      env('COOKIE_SECURE', '') === 'true' ||
      (env('COOKIE_SECURE', '') === '' &&
        env('NODE_ENV', 'development') === 'production'),
    cookieSameSite: parseSameSite(env('COOKIE_SAME_SITE', 'lax')),
  }),
);

function parseSameSite(value: string): 'lax' | 'strict' | 'none' {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'strict' || normalized === 'none' || normalized === 'lax') {
    return normalized;
  }
  return 'lax';
}

/** Named env namespaces available via RoomlyConfigModule.forRoot({ load }) */
export const CONFIG_NAMESPACES = {
  postgres: postgresConfig,
  redis: redisConfig,
  rabbitmq: rabbitmqConfig,
  services: servicesConfig,
  auth: authConfig,
  authSigning: authSigningConfig,
  gateway: gatewayConfig,
} as const;

export type ConfigNamespace = keyof typeof CONFIG_NAMESPACES;
