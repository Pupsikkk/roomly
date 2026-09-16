/** Build TypeORM postgres options from Roomly config pieces. */
export function buildTypeOrmPostgresOptions(parts: {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  synchronize?: boolean;
  logging?: boolean;
}) {
  return {
    type: 'postgres' as const,
    host: parts.host,
    port: parts.port,
    username: parts.user,
    password: parts.password,
    database: parts.database,
    synchronize: parts.synchronize ?? false,
    logging: parts.logging ?? false,
  };
}
