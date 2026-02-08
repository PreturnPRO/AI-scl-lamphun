import type { UserRepository } from '../repositories/UserRepository'

type RegisterInput = {
  firstname: string
  lastname: string
  username: string
  role: string
  email: string
  password: string
}

type LoginInput = {
  identifier: string
  password: string
}

export class UserService {
  constructor(private readonly users: UserRepository) {}

  async register(data: RegisterInput) {
    const hashedPassword = await Bun.password.hash(data.password)

    await this.users.create({
      firstname: data.firstname,
      lastname: data.lastname,
      username: data.username,
      role: data.role,
      email: data.email,
      password: hashedPassword
    })

    return { status: 'User registered successfully' }
  }

  async login(data: LoginInput) {
    const user = await this.users.findByUsernameOrEmail(data.identifier)

    if (!user || !user.password) {
      return new Response('User not found or password not set', { status: 404 })
    }

    const valid = await Bun.password.verify(data.password, user.password)

    if (!valid) {
      return new Response('Invalid password', { status: 401 })
    }

    return {
      message: 'Login successful',
      userId: user.id
    }
  }
}
