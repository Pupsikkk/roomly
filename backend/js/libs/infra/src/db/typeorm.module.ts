import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomlyConfigService } from '@roomly/common';
import type { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { resolvePostgresDatabaseName } from './database-name';
import type { PostgresDatabase } from './tokens';
import { buildTypeOrmPostgresOptions } from './typeorm-options';

export interface RoomlyTypeOrmModuleOptions {
  /** Logical DB from RoomlyConfigService.postgres (user | hotel | booking) */
  database: PostgresDatabase;
  entities: EntityClassOrSchema[];
  isGlobal?: boolean;
  /** Override; default: false (use migrations) */
  synchronize?: boolean;
  /** Override; default: development only */
  logging?: boolean;
}

@Module({})
export class RoomlyTypeOrmModule {
  static forRoot(options: RoomlyTypeOrmModuleOptions): DynamicModule {
    return {
      module: RoomlyTypeOrmModule,
      global: options.isGlobal ?? false,
      imports: [
        TypeOrmModule.forRootAsync({
          inject: [RoomlyConfigService],
          useFactory: (config: RoomlyConfigService) => {
            const pg = config.postgres;
            return {
              ...buildTypeOrmPostgresOptions({
                host: pg.host,
                port: pg.port,
                user: pg.user,
                password: pg.password,
                database: resolvePostgresDatabaseName(pg, options.database),
                synchronize: options.synchronize ?? false,
                logging:
                  options.logging ?? config.nodeEnv === 'development',
              }),
              entities: options.entities,
            };
          },
        }),
      ],
      exports: [TypeOrmModule],
    };
  }
}
