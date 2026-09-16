import type { PostgresConfig } from '@roomly/common';
import type { PostgresDatabase } from './tokens';

export function resolvePostgresDatabaseName(
  pg: PostgresConfig,
  database: PostgresDatabase,
): string {
  switch (database) {
    case 'user':
      return pg.userDbName;
    case 'hotel':
      return pg.hotelDbName;
    case 'booking':
      return pg.bookingDbName;
  }
}
