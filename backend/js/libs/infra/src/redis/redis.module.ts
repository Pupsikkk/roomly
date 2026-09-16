import {
  DynamicModule,
  Injectable,
  Logger,
  Module,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { RoomlyConfigService } from '@roomly/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './tokens';

export interface RedisModuleOptions {
  isGlobal?: boolean;
  /** Connect on module init (default: true) */
  connectOnInit?: boolean;
  /**
   * Service key namespace applied to every Redis command via ioredis `keyPrefix`.
   * Prefer trailing colon, e.g. `roomly:gateway:`.
   */
  keyPrefix?: string;
}

@Injectable()
export class RedisClientService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisClientService.name);
  readonly client: Redis;
  readonly keyPrefix: string;
  private readonly connectOnInit: boolean;

  constructor(
    config: RoomlyConfigService,
    options: RedisModuleOptions = {},
  ) {
    this.connectOnInit = options.connectOnInit ?? true;
    this.keyPrefix = options.keyPrefix ?? '';
    const { host, port } = config.redis;
    this.client = new Redis({
      host,
      port,
      keyPrefix: this.keyPrefix || undefined,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });
  }

  async onModuleInit() {
    if (!this.connectOnInit) return;
    await this.client.connect();
    this.logger.log(
      this.keyPrefix
        ? `Redis connected (keyPrefix=${this.keyPrefix})`
        : 'Redis connected',
    );
  }

  async onModuleDestroy() {
    if (this.client.status !== 'end') {
      await this.client.quit();
    }
  }
}

@Module({})
export class RedisModule {
  static forRoot(options: RedisModuleOptions = {}): DynamicModule {
    return {
      module: RedisModule,
      global: options.isGlobal ?? false,
      providers: [
        {
          provide: RedisClientService,
          useFactory: (config: RoomlyConfigService) =>
            new RedisClientService(config, options),
          inject: [RoomlyConfigService],
        },
        {
          provide: REDIS_CLIENT,
          useFactory: (svc: RedisClientService) => svc.client,
          inject: [RedisClientService],
        },
      ],
      exports: [RedisClientService, REDIS_CLIENT],
    };
  }
}
