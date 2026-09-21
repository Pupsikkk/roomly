import { randomUUID } from 'node:crypto';
import { User } from '../../domain';
import { PasswordUtils } from '../utils/password.utils';
import type { InMemoryUserRepository } from './in-memory-user.repository';

/** Seed a user with a real bcrypt hash into an in-memory repo. */
export async function seedUser(
  users: InMemoryUserRepository,
  opts: { email: string; password: string; id?: string } = {
    email: 'user@roomly.test',
    password: 'Secret123!',
  },
): Promise<User> {
  const now = new Date();
  const user = new User({
    id: opts.id ?? randomUUID(),
    email: opts.email.trim().toLowerCase(),
    passwordHash: await PasswordUtils.hash(opts.password),
    createdAt: now,
    updatedAt: now,
  });
  await users.save(user);
  return user;
}
