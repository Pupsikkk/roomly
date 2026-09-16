import { User } from '../../../../../domain/user';
import { UserOrmEntity } from './user.orm-entity';

export function toDomain(row: UserOrmEntity): User {
  return new User({
    id: row.id,
    email: row.email,
    passwordHash: row.passwordHash,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export function toOrm(user: User): UserOrmEntity {
  const row = new UserOrmEntity();
  row.id = user.id;
  row.email = user.email;
  row.passwordHash = user.passwordHash;
  row.createdAt = user.createdAt;
  row.updatedAt = user.updatedAt;
  return row;
}
