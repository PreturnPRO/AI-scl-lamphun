import type { MySql2Database } from 'drizzle-orm/mysql2'
import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { sessions } from '../db/schema'

type SessionRecord = typeof sessions.$inferSelect
type NewSession = typeof sessions.$inferInsert

export class SessionRepository {
  constructor(private readonly db: MySql2Database) {}

  async findByToken(token: string) {
    const result = await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1)

    return result[0] ?? null
  }

  async create(session: NewSession) {
    await this.db.insert(sessions).values(session)
  }

  async deleteByToken(token: string) {
    await this.db.delete(sessions).where(eq(sessions.token, token))
  }

  async deleteByUserId(userId: number) {
    await this.db.delete(sessions).where(eq(sessions.userId, userId))
  }
}
