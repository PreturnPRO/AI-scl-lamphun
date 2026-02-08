import type { AppConfig } from '../config/AppConfig'
import type { JwtHelpers, JwtPayload, JwtVerifyResult } from '../types/JwtHelpers'
import type { SessionRepository } from '../repositories/SessionRepository'
import type { UserRepository } from '../repositories/UserRepository'

type LoginInput = {
  email: string
  password: string
}

type RegisterInput = {
  firstname: string
  lastname: string
  username: string
  email: string
  password: string
}

type AuthUser = {
  id: number
  username: string
}

export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly sessions: SessionRepository,
    private readonly config: AppConfig
  ) {}

  async login(data: LoginInput, jwt: JwtHelpers) {
    const user = await this.users.findByEmail(data.email)

    if (!user || !user.password) {
      return new Response('User not found or password not set', { status: 404 })
    }

    const valid = await Bun.password.verify(data.password, user.password)

    if (!valid) {
      return new Response('Invalid password', { status: 401 })
    }

    const accessToken = await jwt.sign(this.buildAccessPayload({
      id: user.id,
      username: user.username ?? ''
    }))
    const refreshToken = crypto.randomUUID()
    const refreshExpiresAt = this.buildRefreshExpiry()

    await this.sessions.create({
      userId: user.id,
      token: refreshToken,
      expires_at: refreshExpiresAt
    })

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username ?? ''
      }
    }
  }

  async register(data: RegisterInput) {
    const exists = await this.users.existsByEmailOrUsername(data.email, data.username)

    if (exists) {
      return new Response('User already exists', { status: 409 })
    }

    const hashedPassword = await Bun.password.hash(data.password)

    await this.users.create({
      firstname: data.firstname,
      lastname: data.lastname,
      username: data.username,
      email: data.email,
      password: hashedPassword
    })

    return { success: true }
  }

  async me(authorization: string | undefined, jwt: JwtHelpers) {
    const token = this.parseBearerToken(authorization)

    if (!token) {
      return new Response('Missing Authorization header', { status: 401 })
    }

    const payload = await jwt.verify(token)

    if (!this.isJwtPayload(payload)) {
      return new Response('Invalid token', { status: 401 })
    }

    const user = await this.users.findById(payload.id)

    if (!user) {
      return new Response('User not found', { status: 404 })
    }

    return {
      id: user.id,
      username: user.username ?? '',
      email: user.email
    }
  }

  async refresh(refreshToken: string, jwt: JwtHelpers) {
    const session = await this.sessions.findByToken(refreshToken)

    if (!session) {
      return new Response('Refresh token not found', { status: 401 })
    }

    if (!session.expires_at) {
      await this.sessions.deleteByToken(refreshToken)
      return new Response('Refresh token expired', { status: 401 })
    }

    const expiresAt = new Date(session.expires_at)

    if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() < Date.now()) {
      await this.sessions.deleteByToken(refreshToken)
      return new Response('Refresh token expired', { status: 401 })
    }

    const user = await this.users.findById(session.userId)

    if (!user) {
      return new Response('User not found', { status: 404 })
    }

    const accessToken = await jwt.sign(this.buildAccessPayload({
      id: user.id,
      username: user.username ?? ''
    }))

    return { accessToken }
  }

  async logout(authorization: string | undefined, jwt: JwtHelpers) {
    const token = this.parseBearerToken(authorization)

    if (!token) {
      return new Response('Missing Authorization header', { status: 401 })
    }

    const payload = await jwt.verify(token)

    if (!this.isJwtPayload(payload)) {
      return new Response('Invalid token', { status: 401 })
    }

    await this.sessions.deleteByUserId(payload.id)

    return { success: true }
  }

  private buildAccessPayload(user: AuthUser) {
    return {
      id: user.id,
      username: user.username,
      exp: Math.floor(Date.now() / 1000) + this.config.jwtAccessExpiresSeconds
    }
  }

  private buildRefreshExpiry() {
    const ms = this.config.jwtRefreshExpiresDays * 24 * 60 * 60 * 1000
    return new Date(Date.now() + ms).toISOString()
  }

  private parseBearerToken(authHeader: string | undefined) {
    if (!authHeader) return null
    const [scheme, token] = authHeader.split(' ')
    if (scheme !== 'Bearer' || !token) return null
    return token
  }

  private isJwtPayload(payload: JwtVerifyResult): payload is JwtPayload & { id: number } {
    return Boolean(payload && typeof (payload as JwtPayload).id === 'number')
  }
}
