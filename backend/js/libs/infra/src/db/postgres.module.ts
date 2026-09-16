import {
  DynamicModule,
  Inject,
  Injectable,
  Module,
  OnModuleDestroy,
  type Provider,
} from '@nestjs/common';
import { RoomlyConfigService } from '@roomly/common';
import { Pool, type PoolConfig } from 'pg';
import { buildPostgresUrl } from './postgres-url';
import { resolvePostgresDatabaseName } from './database-name';
import { POSTGRES_POOL, type PostgresDatabase } from './tokens';

export interface PostgresModuleOptions {
  /** Which logical DB from config (default: user) */
  database?: PostgresDatabase;
  isGlobal?: boolean;
  /** Extra pg Pool options */
  pool?: Omit<PoolConfig, 'host' | 'port' | 'user' | 'password' | 'database'>;
}

export const POSTGRES_MODULE_OPTIONS = Symbol('POSTGRES_MODULE_OPTIONS');

@Injectable()
export class PostgresPoolService implements OnModuleDestroy {
  readonly pool: Pool;
  readonly databaseUrl: string;

  constructor(
    config: RoomlyConfigService,
    @Inject(POSTGRES_MODULE_OPTIONS) options: PostgresModuleOptions,
  ) {
    const pg = config.postgres;
    const database = resolvePostgresDatabaseName(
      pg,
      options.database ?? 'user',
    );
    this.databaseUrl = buildPostgresUrl({
      host: pg.host,
      port: pg.port,
      user: pg.user,
      password: pg.password,
      database,
    });
    this.pool = new Pool({
      host: pg.host,
      port: pg.port,
      user: pg.user,
      password: pg.password,
      database,
      ...options.pool,
    });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}

@Module({})
export class PostgresModule {
  static forRoot(options: PostgresModuleOptions = {}): DynamicModule {
    const optionsProvider: Provider = {
      provide: POSTGRES_MODULE_OPTIONS,
      useValue: options,
    };

    return {
      module: PostgresModule,
      global: options.isGlobal ?? false,
      providers: [
        optionsProvider,
        PostgresPoolService,
        {
          provide: POSTGRES_POOL,
          useFactory: (svc: PostgresPoolService) => svc.pool,
          inject: [PostgresPoolService],
        },
      ],
      exports: [PostgresPoolService, POSTGRES_POOL],
    };
  }
}
