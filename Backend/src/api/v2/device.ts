import { Elysia, t } from 'elysia'

const deviceDataItem = t.Object({
  monitorItem: t.String(),
  monitorTime: t.String(),
  monitorValue: t.String(),
  nodeId: t.Optional(t.String())
})

const deviceResponseItem = t.Object({
  data: t.Array(deviceDataItem),
  dataStatus: t.Number(),
  deviceId: t.String(),
  deviceStatus: t.Number(),
  id: t.Number(),
  customname: t.String(),
  name: t.String(),
  sensorNumber: t.Number()
})

const deviceResponseSchema = t.Object({
  code: t.Number(),
  data: t.Array(deviceResponseItem),
  message: t.String(),
  status: t.String()
})

const buildEmptyResponse = (deviceId: string) => ({
  code: 0,
  data: [
    {
      data: [],
      dataStatus: 0,
      deviceId,
      deviceStatus: 0,
      id: 0,
      customname: '',
      name: '',
      sensorNumber: 0
    }
  ],
  message: 'ok',
  status: 'ok'
})

export const deviceV2Routes = new Elysia({
  prefix: '/api/v2/device'
})
  .post(
    '/',
    ({ body }) => {
      const { deviceId } = body

      return buildEmptyResponse(deviceId)
    },
    {
      body: t.Object({
        deviceId: t.String(),
        deviceSecretKey: t.String(),
        minitorItem: t.String(),
        start: t.Number(),
        end: t.Number()
      }),
      response: deviceResponseSchema
    }
  )
  .post(
    '/batch',
    ({ body }) => {
      const firstDevice = body.deviceList[0]
      const deviceId = firstDevice ? firstDevice.deviceId : ''

      return buildEmptyResponse(deviceId)
    },
    {
      body: t.Object({
        deviceList: t.Array(
          t.Object({
            deviceId: t.String(),
            deviceSecretKey: t.String()
          })
        ),
        monitorItem: t.Array(t.String()),
        start: t.Number(),
        end: t.Number()
      }),
      response: deviceResponseSchema
    }
  )
  .post(
    '/latest',
    ({ body }) => {
      const { deviceId } = body

      return buildEmptyResponse(deviceId)
    },
    {
      body: t.Object({
        deviceId: t.String(),
        deviceSecretKey: t.String(),
        monitorItem: t.String()
      }),
      response: deviceResponseSchema
    }
  )
