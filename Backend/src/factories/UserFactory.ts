import type { MySql2Database } from 'drizzle-orm/mysql2'
import { UserController } from '../controllers/UserController'
import { UserRepository } from '../repositories/UserRepository'
import { UserService } from '../services/UserService'

export class UserFactory {
  static create(db: MySql2Database) {
    const userRepository = new UserRepository(db)
    const userService = new UserService(userRepository)

    return new UserController(userService)
  }
}
