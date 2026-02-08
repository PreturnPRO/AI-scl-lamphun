import type { MySql2Database } from 'drizzle-orm/mysql2'
import type { AppConfig } from '../config/AppConfig'
import { AuthController } from '../controllers/AuthController'
import { SessionRepository } from '../repositories/SessionRepository'
import { UserRepository } from '../repositories/UserRepository'
import { AuthService } from '../services/AuthService'

export class AuthFactory {
  static create(db: MySql2Database, config: AppConfig) {
    const userRepository = new UserRepository(db)
    const sessionRepository = new SessionRepository(db)
    const authService = new AuthService(userRepository, sessionRepository, config)

    return new AuthController(authService)
  }
}
