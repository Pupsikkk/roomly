/** Build a postgres URL from connection pieces. */
export function buildPostgresUrl(parts: {
  user: string;
  password: string;
  host: string;
  port: number;
  database: string;
}): string {
  const { user, password, host, port, database } = parts;
  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
}
