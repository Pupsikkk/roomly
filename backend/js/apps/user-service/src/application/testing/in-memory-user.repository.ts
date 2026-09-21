import type { User } from '../../domain/user';
import type { UserRepository } from '../ports/user.repository';

/** In-memory UserRepository for application unit tests. */
export class InMemoryUserRepository implements UserRepository {
  private readonly byId = new Map<string, User>();
  private readonly byEmail = new Map<string, User>();

  async save(user: User): Promise<User> {
    this.byId.set(user.id, user);
    this.byEmail.set(user.email.toLowerCase(), user);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.byId.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.byEmail.get(email.trim().toLowerCase()) ?? null;
  }
}
