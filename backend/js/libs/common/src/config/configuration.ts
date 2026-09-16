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
  notificationServiceUrl: string;
  hotelServiceUrl: string;
  bookingServiceUrl: string;
}

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
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
  (): ServicesConfig => ({
    gatewayPort: envInt('GATEWAY_PORT', DEFAULT_PORTS.gateway),
    userPort: envInt('USER_SERVICE_PORT', DEFAULT_PORTS.user),
    notificationPort: envInt(
      'NOTIFICATION_SERVICE_PORT',
      DEFAULT_PORTS.notification,
    ),
    gatewayUrl: env('GATEWAY_URL', `http://localhost:${DEFAULT_PORTS.gateway}`),
    userServiceUrl: env(
      'USER_SERVICE_URL',
      `http://localhost:${DEFAULT_PORTS.user}`,
    ),
    notificationServiceUrl: env(
      'NOTIFICATION_SERVICE_URL',
      `http://localhost:${DEFAULT_PORTS.notification}`,
    ),
    hotelServiceUrl: env('HOTEL_SERVICE_URL', 'http://localhost:8000'),
    bookingServiceUrl: env('BOOKING_SERVICE_URL', 'http://localhost:8001'),
  }),
);

export const authConfig = registerAs(
  'auth',
  (): AuthConfig => ({
    jwtSecret: env('JWT_SECRET', 'roomly-dev-secret-change-me'),
    jwtExpiresIn: env('JWT_EXPIRES_IN', '7d'),
  }),
);

/** Named env namespaces available via RoomlyConfigModule.forRoot({ load }) */
export const CONFIG_NAMESPACES = {
  postgres: postgresConfig,
  redis: redisConfig,
  rabbitmq: rabbitmqConfig,
  services: servicesConfig,
  auth: authConfig,
} as const;

export type ConfigNamespace = keyof typeof CONFIG_NAMESPACES;
