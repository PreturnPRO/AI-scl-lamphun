import { Elysia, t } from 'elysia'
import { jwt } from '@elysiajs/jwt'
import type { AuthController } from '../../controllers/AuthController'

export const createAuthRoutes = (controller: AuthController, jwtSecret: string) =>
  new Elysia({
    prefix: '/api/v2/auth'
  })
    .use(
      jwt({
        name: 'jwt',
        secret: jwtSecret
      })
    )
    .post(
      '/login',
      controller.login,
      {
        body: t.Object({
          email: t.String({ format: 'email' }),
          password: t.String()
        })
      }
    )
    .post(
      '/register',
      controller.register,
      {
        body: t.Object({
          firstname: t.String(),
          lastname: t.String(),
          username: t.String(),
          email: t.String({ format: 'email' }),
          password: t.String({ minLength: 8 })
        })
      }
    )
    .get(
      '/me',
      controller.me,
      {
        headers: t.Object({
          authorization: t.String()
        })
      }
    )
    .post(
      '/refresh',
      controller.refresh,
      {
        body: t.Object({
          refreshToken: t.String()
        })
      }
    )
    .post(
      '/logout',
      controller.logout,
      {
        headers: t.Object({
          authorization: t.String()
        })
      }
    )
