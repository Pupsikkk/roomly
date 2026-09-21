import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export function env(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

/** Paths to try when loading infra/secrets/.env (Docker already injects env). */
export function resolveEnvFilePaths(): string[] {
  const cwd = process.cwd();
  const candidates = [
    resolve(cwd, '../../infra/secrets/.env'), // nest from backend/js
    resolve(cwd, '../infra/secrets/.env'), // from backend/
    resolve(cwd, 'infra/secrets/.env'), // from repo root
    resolve(cwd, '../../infra/.env'), // legacy
    resolve(cwd, '../infra/.env'),
    resolve(cwd, 'infra/.env'),
    resolve(cwd, '.env'),
  ];
  return candidates.filter((path) => existsSync(path));
}
