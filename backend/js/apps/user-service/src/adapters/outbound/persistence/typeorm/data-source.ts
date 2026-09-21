import 'reflect-metadata';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';
import { DataSource } from 'typeorm';
import { UserOrmEntity } from './user/user.orm-entity';

/** Load infra/secrets/.env for TypeORM CLI (Nest ConfigModule is not used here). */
function loadCliEnv(): void {
  const cwd = process.cwd();
  const candidates = [
    resolve(cwd, '../../infra/secrets/.env'),
    resolve(cwd, '../infra/secrets/.env'),
    resolve(cwd, 'infra/secrets/.env'),
    resolve(cwd, '../../infra/.env'),
    resolve(cwd, '../infra/.env'),
    resolve(cwd, 'infra/.env'),
    resolve(cwd, '.env'),
  ];
  for (const path of candidates) {
    if (existsSync(path)) {
      loadEnv({ path });
      break;
    }
  }
}

loadCliEnv();

function env(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

/**
 * CLI DataSource for user_db migrations.
 * Usage: npm run migration:run:user
 */
export default new DataSource({
  type: 'postgres',
  host: env('POSTGRES_HOST', 'localhost'),
  port: envInt('POSTGRES_PORT', 5432),
  username: env('POSTGRES_USER', 'roomly'),
  password: env('POSTGRES_PASSWORD', 'roomly'),
  database: env('USER_DB_NAME', 'user_db'),
  entities: [UserOrmEntity],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true,
});
