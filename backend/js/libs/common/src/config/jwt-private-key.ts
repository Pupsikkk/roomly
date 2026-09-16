import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { AuthSigningConfig } from './configuration';

/**
 * Resolve the RSA private key PEM for user-service signing.
 * Prefers `jwtPrivateKeyPath`, then `jwtPrivateKeyPem`.
 */
export function resolveJwtPrivateKeyPem(signing: AuthSigningConfig): string {
  if (signing.jwtPrivateKeyPath) {
    const path = resolve(signing.jwtPrivateKeyPath);
    try {
      return readFileSync(path, 'utf8');
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Failed to read JWT private key at ${path}: ${reason}`,
      );
    }
  }

  if (signing.jwtPrivateKeyPem) {
    return signing.jwtPrivateKeyPem.replace(/\\n/g, '\n');
  }

  throw new Error(
    'JWT private key not configured. Set JWT_PRIVATE_KEY_PATH or JWT_PRIVATE_KEY (user-service only).',
  );
}
