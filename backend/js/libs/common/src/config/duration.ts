/**
 * Parse jose-style durations like `15m`, `7d` into seconds.
 * Supports s / m / h / d.
 */
export function durationToSeconds(value: string): number {
  const match = /^(\d+)([smhd])$/i.exec(value.trim());
  if (!match) {
    throw new Error(
      `Invalid duration "${value}". Use forms like 15m, 1h, 7d.`,
    );
  }
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const factor =
    unit === 's' ? 1 : unit === 'm' ? 60 : unit === 'h' ? 3600 : 86_400;
  return amount * factor;
}
