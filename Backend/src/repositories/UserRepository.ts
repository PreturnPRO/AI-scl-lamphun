import type { MySql2Database } from 'drizzle-orm/mysql2'
import { eq, or } from 'drizzle-orm/sql/expressions/conditions'
import { users } from '../db/schema'

type UserRecord = typeof users.$inferSelect
type NewUser = typeof users.$inferInsert

export class UserRepository {
  constructor(private readonly db: MySql2Database) {}

  async findByEmail(email: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    return result[0] ?? null
  }

  async findByUsernameOrEmail(identifier: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(or(eq(users.username, identifier), eq(users.email, identifier)))
      .limit(1)

    return result[0] ?? null
  }

  async findById(id: number) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    return result[0] ?? null
  }

  async existsByEmailOrUsername(email: string, username: string) {
    const result = await this.db
      .select({ id: users.id })
      .from(users)
      .where(or(eq(users.email, email), eq(users.username, username)))
      .limit(1)

    return result.length > 0
  }

  async create(user: NewUser) {
    await this.db.insert(users).values(user)
  }
}
