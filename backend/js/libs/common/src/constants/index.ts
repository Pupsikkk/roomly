/** Fallback ports when PORT / *_PORT env vars are not set */
export const DEFAULT_PORTS = {
  gateway: 3000,
  user: 3001,
  notification: 3002,
} as const;

/** @deprecated use RoomlyConfigService.resolveServicePort() */
export const SERVICE_PORTS = DEFAULT_PORTS;

/** @deprecated use RoomlyConfigService */
export function resolvePort(
  service: keyof typeof DEFAULT_PORTS,
  portEnvKey: string,
): number {
  const raw = process.env.PORT ?? process.env[portEnvKey];
  const fallback = DEFAULT_PORTS[service];
  if (!raw) return fallback;
  const port = Number(raw);
  return Number.isFinite(port) ? port : fallback;
}
