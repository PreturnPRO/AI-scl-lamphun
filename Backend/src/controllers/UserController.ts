import type { UserService } from '../services/UserService'

type RegisterContext = {
  body: {
    firstname: string
    lastname: string
    username: string
    role: string
    email: string
    password: string
  }
}

type LoginContext = {
  body: {
    identifier: string
    password: string
  }
}

export class UserController {
  constructor(private readonly userService: UserService) {}

  register = async ({ body }: RegisterContext) => this.userService.register(body)

  login = async ({ body }: LoginContext) => this.userService.login(body)
}
