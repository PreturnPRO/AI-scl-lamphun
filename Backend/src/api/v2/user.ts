import { Elysia, t } from 'elysia'
import { db } from '../..'
import { eq, or } from 'drizzle-orm/sql/expressions/conditions'
import { users } from '../../db/schema'

const userRoutes = new Elysia({
  prefix: '/api/v2/user'
})
.post(
  '/register',
  async ({ body }) => {
    const { firstname, lastname, username, role, email, password } = body
    const hashedPassword = await Bun.password.hash(password)
    const database = await db

    await database.insert(users).values({
      firstname,
      lastname,
      username,
      email,
      role,
      password: hashedPassword
    })

    return {
      status: 'User registered successfully'
    }
  },
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
  async ({ body }) => {
    const { identifier, password } = body
    const database = await db

    const user = await database
      .select()
      .from(users)
      .where(
        or(
          eq(users.username, identifier),
          eq(users.email, identifier)
        )
      )
      .limit(1)

    if (user.length === 0 || !user[0].password) {
      return new Response('User not found or password not set', { status: 404 })
    }

    const valid = await Bun.password.verify(
      password,
      user[0].password
    )

    if (!valid) {
      return new Response('Invalid password', { status: 401 })
    }

    return {
      message: 'Login successful',
      userId: user[0].id
    }
  },
  {
    body: t.Object({
      identifier: t.String(),
      password: t.String()
    })
  }
)

export { userRoutes }