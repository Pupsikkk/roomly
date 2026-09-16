#!/usr/bin/env node
/**
 * Generate a local RSA private key for user-service JWT signing (dev).
 * Skips if the key already exists (unless --force).
 *
 *   npm run auth:keys
 *   npm run auth:keys -- --force
 */

import { generateKeyPairSync } from 'node:crypto';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const KEY_DIR = path.join(ROOT, 'infra', 'secrets', 'dev');
const PRIVATE_KEY_PATH = path.join(KEY_DIR, 'jwt-private.pem');

const force = process.argv.includes('--force');

export function ensureDevJwtPrivateKey({ force: forceWrite = false } = {}) {
  mkdirSync(KEY_DIR, { recursive: true });

  if (existsSync(PRIVATE_KEY_PATH) && !forceWrite) {
    console.log(`JWT private key already exists: ${PRIVATE_KEY_PATH}`);
    return PRIVATE_KEY_PATH;
  }

  const { privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  writeFileSync(PRIVATE_KEY_PATH, privateKey, { mode: 0o600 });
  console.log(
    forceWrite
      ? `Regenerated JWT private key: ${PRIVATE_KEY_PATH}`
      : `Created JWT private key: ${PRIVATE_KEY_PATH}`,
  );
  return PRIVATE_KEY_PATH;
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  ensureDevJwtPrivateKey({ force });
}
