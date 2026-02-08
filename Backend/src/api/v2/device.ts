import { Elysia, t } from 'elysia'
import type { DeviceController } from '../../controllers/DeviceController'

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

export const createDeviceRoutes = (controller: DeviceController) =>
  new Elysia({
    prefix: '/api/v2/device'
  })
    .post(
      '/',
      controller.getStatus,
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
      controller.getBatchStatus,
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
      controller.getLatest,
      {
        body: t.Object({
          deviceId: t.String(),
          deviceSecretKey: t.String(),
          monitorItem: t.String()
        }),
        response: deviceResponseSchema
      }
    )
