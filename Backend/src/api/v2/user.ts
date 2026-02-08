import { Elysia, t } from 'elysia'
import type { UserController } from '../../controllers/UserController'

export const createUserRoutes = (controller: UserController) =>
  new Elysia({
    prefix: '/api/v2/user'
  })
    .post(
      '/register',
      controller.register,
      {
        body: t.Object({
          firstname: t.String(),
          lastname: t.String(),
          username: t.String(),
          role: t.String(),
          email: t.String({ format: 'email' }),
          password: t.String({ minLength: 8 })
        })
      }
    )
    .post(
      '/login',
      controller.login,
      {
        body: t.Object({
          identifier: t.String(),
          password: t.String()
        })
      }
    )