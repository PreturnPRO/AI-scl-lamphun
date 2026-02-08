export interface DatabaseConfigValues {
  host: string
  port: number
  username: string
  password: string
  database: string
}

const requireEnv = (value: string | undefined, key: string) => {
  if (!value) {
    throw new Error(`${key} is not set`)
  }

  return value
}

const parseNumber = (value: string | undefined, fallback: number) => {
  if (!value) return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export class DatabaseConfig {
  constructor(private readonly values: DatabaseConfigValues) {}

  static fromEnv(env: NodeJS.ProcessEnv = process.env) {
    return new DatabaseConfig({
      host: requireEnv(env.DB_HOST, 'DB_HOST'),
      port: parseNumber(env.DB_PORT, 3306),
      username: requireEnv(env.DB_USERNAME, 'DB_USERNAME'),
      password: requireEnv(env.DB_PASSWORD, 'DB_PASSWORD'),
      database: requireEnv(env.DB_DATABASE, 'DB_DATABASE')
    })
  }

  get host() {
    return this.values.host
  }

  get port() {
    return this.values.port
  }

  get username() {
    return this.values.username
  }

  get password() {
    return this.values.password
  }

  get database() {
    return this.values.database
  }
}
