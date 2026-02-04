import { Elysia, t } from 'elysia'

export const deviceV2Routes = new Elysia({
  prefix: '/api/v2/device'
})
  .post(
    '/latest',
    ({ headers, body }) => {
      const userApi = headers['x-user-api']
      const { deviceId, deviceKey } = body

      if (!userApi) {
        return new Response('Missing user API key', { status: 401 })
      }

      // Example checks
      // 1. validate user api
      // 2. validate deviceId + deviceKey

      return {
        userApi,
        deviceId,
        status: 'ok'
      }
    },
    {
      body: t.Object({
        deviceId: t.String(),
        deviceKey: t.String()
      })
    }
  )
