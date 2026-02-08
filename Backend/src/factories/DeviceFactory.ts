import { DeviceController } from '../controllers/DeviceController'
import { DeviceService } from '../services/DeviceService'

export class DeviceFactory {
  static create() {
    const deviceService = new DeviceService()

    return new DeviceController(deviceService)
  }
}
