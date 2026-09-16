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

/** Paths to try when loading infra/.env (Docker already injects env). */
export function resolveEnvFilePaths(): string[] {
  const cwd = process.cwd();
  const candidates = [
    resolve(cwd, '../../infra/.env'), // nest from backend/js
    resolve(cwd, '../infra/.env'), // from backend/
    resolve(cwd, 'infra/.env'), // from repo root
    resolve(cwd, '.env'),
  ];
  return candidates.filter((path) => existsSync(path));
}
