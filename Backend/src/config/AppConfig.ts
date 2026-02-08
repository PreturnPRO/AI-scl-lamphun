export interface AppConfigValues {
  port: number
  jwtSecret: string
  jwtAccessExpiresSeconds: number
  jwtRefreshExpiresDays: number
}

const parseNumber = (value: string | undefined, fallback: number) => {
  if (!value) return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export class AppConfig {
  constructor(private readonly values: AppConfigValues) {}

  static fromEnv(env: NodeJS.ProcessEnv = process.env) {
    return new AppConfig({
      port: parseNumber(env.PORT, 3000),
      jwtSecret: env.JWT_SECRET ?? 'change-me',
      jwtAccessExpiresSeconds: parseNumber(env.JWT_ACCESS_EXPIRES_SECONDS, 900),
      jwtRefreshExpiresDays: parseNumber(env.JWT_REFRESH_EXPIRES_DAYS, 7)
    })
  }

  get port() {
    return this.values.port
  }

  get jwtSecret() {
    return this.values.jwtSecret
  }

  get jwtAccessExpiresSeconds() {
    return this.values.jwtAccessExpiresSeconds
  }

  get jwtRefreshExpiresDays() {
    return this.values.jwtRefreshExpiresDays
  }
}
