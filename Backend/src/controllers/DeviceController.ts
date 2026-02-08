import type { DeviceService } from '../services/DeviceService'

type DeviceStatusContext = {
  body: {
    deviceId: string
    deviceSecretKey: string
    minitorItem: string
    start: number
    end: number
  }
}

type DeviceBatchContext = {
  body: {
    deviceList: Array<{ deviceId: string; deviceSecretKey: string }>
    monitorItem: string[]
    start: number
    end: number
  }
}

type DeviceLatestContext = {
  body: {
    deviceId: string
    deviceSecretKey: string
    monitorItem: string
  }
}

export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  getStatus = async ({ body }: DeviceStatusContext) => this.deviceService.getStatus(body)

  getBatchStatus = async ({ body }: DeviceBatchContext) =>
    this.deviceService.getBatchStatus(body)

  getLatest = async ({ body }: DeviceLatestContext) => this.deviceService.getLatest(body)
}
