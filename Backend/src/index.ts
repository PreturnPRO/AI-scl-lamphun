import { Elysia } from 'elysia'
import { createAuthRoutes } from './api/v2/auth'
import { createDeviceRoutes } from './api/v2/device'
import { createUserRoutes } from './api/v2/user'
import { AppConfig } from './config/AppConfig'
import { DatabaseConfig } from './config/DatabaseConfig'
import { AuthFactory } from './factories/AuthFactory'
import { DeviceFactory } from './factories/DeviceFactory'
import { UserFactory } from './factories/UserFactory'
import { Database } from './db/database'

class Application {
  constructor(
    private readonly config: AppConfig,
    private readonly database: Database
  ) {}

  async start() {
    const db = await this.database.connect()
    console.log('Database connected successfully')

    const authController = AuthFactory.create(db, this.config)
    const deviceController = DeviceFactory.create()
    const userController = UserFactory.create(db)

    const app = new Elysia()
      .use(createDeviceRoutes(deviceController))
      .use(createAuthRoutes(authController, this.config.jwtSecret))
      .use(createUserRoutes(userController))
      .get('/', () => 'Hello Elysia')
      .listen(this.config.port)

    console.log(
      `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
    )
  }
}

const config = AppConfig.fromEnv()
const dbConfig = DatabaseConfig.fromEnv()
const database = new Database(dbConfig)
const app = new Application(config, database)

void app.start()