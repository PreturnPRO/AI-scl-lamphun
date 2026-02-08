type DeviceDataItem = {
  monitorItem: string
  monitorTime: string
  monitorValue: string
  nodeId?: string
}

type DeviceResponseItem = {
  data: DeviceDataItem[]
  dataStatus: number
  deviceId: string
  deviceStatus: number
  id: number
  customname: string
  name: string
  sensorNumber: number
}

type DeviceResponse = {
  code: number
  data: DeviceResponseItem[]
  message: string
  status: string
}

type DeviceStatusInput = {
  deviceId: string
  deviceSecretKey: string
  minitorItem: string
  start: number
  end: number
}

type DeviceBatchInput = {
  deviceList: Array<{ deviceId: string; deviceSecretKey: string }>
  monitorItem: string[]
  start: number
  end: number
}

type DeviceLatestInput = {
  deviceId: string
  deviceSecretKey: string
  monitorItem: string
}

export class DeviceService {
  getStatus(body: DeviceStatusInput) {
    return this.buildEmptyResponse(body.deviceId)
  }

  getBatchStatus(body: DeviceBatchInput) {
    const firstDevice = body.deviceList[0]
    const deviceId = firstDevice ? firstDevice.deviceId : ''

    return this.buildEmptyResponse(deviceId)
  }

  getLatest(body: DeviceLatestInput) {
    return this.buildEmptyResponse(body.deviceId)
  }

  private buildEmptyResponse(deviceId: string): DeviceResponse {
    return {
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
    }
  }
}
