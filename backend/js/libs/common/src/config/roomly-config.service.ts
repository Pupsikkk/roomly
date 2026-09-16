import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { DEFAULT_PORTS } from '../constants';
import type {
  AuthConfig,
  AuthSigningConfig,
  GatewayConfig,
  PostgresConfig,
  RabbitmqConfig,
  RedisConfig,
  ServicesConfig,
} from './configuration';

@Injectable()
export class RoomlyConfigService {
  constructor(private readonly config: NestConfigService) {}

  get nodeEnv(): string {
    return this.config.get<string>('NODE_ENV', 'development');
  }

  get isProd(): boolean {
    return this.nodeEnv === 'production';
  }

  /** Loaded only if `load` includes `'postgres'` */
  get postgres(): PostgresConfig {
    return this.config.getOrThrow<PostgresConfig>('postgres');
  }

  /** Loaded only if `load` includes `'redis'` */
  get redis(): RedisConfig {
    return this.config.getOrThrow<RedisConfig>('redis');
  }

  /** Loaded only if `load` includes `'rabbitmq'` */
  get rabbitmq(): RabbitmqConfig {
    return this.config.getOrThrow<RabbitmqConfig>('rabbitmq');
  }

  /** Loaded only if `load` includes `'services'` */
  get services(): ServicesConfig {
    return this.config.getOrThrow<ServicesConfig>('services');
  }

  /** Loaded only if `load` includes `'auth'` (no private key) */
  get auth(): AuthConfig {
    const auth = this.config.getOrThrow<AuthConfig>('auth');
    if (auth.jwksUri) {
      return auth;
    }
    const base = this.services.userServiceUrl.replace(/\/$/, '');
    return {
      ...auth,
      jwksUri: `${base}/.well-known/jwks.json`,
    };
  }

  /** Loaded only if `load` includes `'authSigning'` (user-service) */
  get authSigning(): AuthSigningConfig {
    return this.config.getOrThrow<AuthSigningConfig>('authSigning');
  }

  /** Loaded only if `load` includes `'gateway'` */
  get gateway(): GatewayConfig {
    return this.config.getOrThrow<GatewayConfig>('gateway');
  }

  /** Compose `PORT` wins over service-specific env (for Docker). */
  get port() {
    return {
      gateway: this.resolveServicePort('gateway', 'GATEWAY_PORT'),
      user: this.resolveServicePort('user', 'USER_SERVICE_PORT'),
      notification: this.resolveServicePort(
        'notification',
        'NOTIFICATION_SERVICE_PORT',
      ),
    };
  }

  get rabbitmqUrl(): string {
    const { user, password, host, port } = this.rabbitmq;
    return `amqp://${user}:${password}@${host}:${port}`;
  }

  resolveServicePort(
    service: keyof typeof DEFAULT_PORTS,
    portEnvKey: string,
  ): number {
    const fromPort = this.config.get<string>('PORT');
    if (fromPort) {
      const n = Number(fromPort);
      if (Number.isFinite(n)) return n;
    }
    const fromKey = this.config.get<string>(portEnvKey);
    if (fromKey) {
      const n = Number(fromKey);
      if (Number.isFinite(n)) return n;
    }
    return DEFAULT_PORTS[service];
  }
}
