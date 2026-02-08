import type { AuthService } from '../services/AuthService'
import type { JwtHelpers } from '../types/JwtHelpers'

type LoginContext = {
  body: {
    email: string
    password: string
  }
  jwt: JwtHelpers
}

type RegisterContext = {
  body: {
    firstname: string
    lastname: string
    username: string
    email: string
    password: string
  }
}

type MeContext = {
  headers: {
    authorization?: string
  }
  jwt: JwtHelpers
}

type RefreshContext = {
  body: {
    refreshToken: string
  }
  jwt: JwtHelpers
}

type LogoutContext = {
  headers: {
    authorization?: string
  }
  jwt: JwtHelpers
}

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = async ({ body, jwt }: LoginContext) => this.authService.login(body, jwt)

  register = async ({ body }: RegisterContext) => this.authService.register(body)

  me = async ({ headers, jwt }: MeContext) => this.authService.me(headers.authorization, jwt)

  refresh = async ({ body, jwt }: RefreshContext) => this.authService.refresh(body.refreshToken, jwt)

  logout = async ({ headers, jwt }: LogoutContext) => this.authService.logout(headers.authorization, jwt)
}
