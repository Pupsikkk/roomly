function env(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

/** Postgres connection pieces — database name comes from env, not hardcoded in app code */
export function getPostgresConfig(dbNameEnvKey: string, defaultDbName: string) {
  return {
    host: env('POSTGRES_HOST', 'localhost'),
    port: Number(env('POSTGRES_PORT', '5432')),
    user: env('POSTGRES_USER', 'roomly'),
    password: env('POSTGRES_PASSWORD', 'roomly'),
    database: env(dbNameEnvKey, defaultDbName),
  };
}

export function getUserDbConfig() {
  return getPostgresConfig('USER_DB_NAME', 'user_db');
}

export function getUserDatabaseUrl(): string {
  const { host, port, user, password, database } = getUserDbConfig();
  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
}
