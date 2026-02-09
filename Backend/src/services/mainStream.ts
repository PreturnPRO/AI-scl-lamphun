import type { MySql2Database } from 'drizzle-orm/mysql2'
import { deviceData } from '../db/schema'

type MainStreamDevice = {
  deviceId: string
  deviceSecretKey: string
  monitorItem: string
}

type MainStreamBatchResponse = {
  code: number
  data: Array<{
    data: Array<{
      monitorItem: string
      monitorTime: string
      monitorValue: string
      nodeId?: string
    }>
    dataStatus: number
    deviceId: string
    deviceStatus: number
    id: number
    customname: string
    name: string
    sensorNumber: number
  }>
  message: string
  status: string
}

const hourMs = 30 * 60 * 1000

const translateMainStreamMessage = (message: string) => {
  const translations: Record<string, string> = {
    '当前ip并发查询限制为1次,每秒钟查询限制为1次,每分钟查询限制为10次,限制条件触发':
      'Rate limit triggered: 1 concurrent, 1 per second, 10 per minute.'
  }

  return translations[message] ?? message
}

const buildDevicesFromEnv = (): MainStreamDevice[] => {
  const devices: MainStreamDevice[] = []

  if (
    process.env.water_monitor_id &&
    process.env.water_monitor_secret_key &&
    process.env.water_monitor_name
  ) {
    devices.push({
      deviceId: process.env.water_monitor_id,
      deviceSecretKey: process.env.water_monitor_secret_key,
      monitorItem: process.env.water_monitor_name
    })
  }

  if (
    process.env.rain_monitor_id &&
    process.env.rain_monitor_secret_key &&
    process.env.rain_monitor_name
  ) {
    devices.push({
      deviceId: process.env.rain_monitor_id,
      deviceSecretKey: process.env.rain_monitor_secret_key,
      monitorItem: process.env.rain_monitor_name
    })
  }

  return devices
}

const fetchBatch = async (
  baseUrl: string,
  devices: MainStreamDevice[],
  start: number,
  end: number
) => {
  const response = await fetch(`${baseUrl}/batch`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      deviceList: devices.map(({ deviceId, deviceSecretKey }) => ({
        deviceId,
        deviceSecretKey
      })),
      monitorItem: devices.map((device) => device.monitorItem),
      start,
      end
    })
  })

  if (!response.ok) {
    const text = await response.text()
    let translated = text

    try {
      const json = JSON.parse(text) as { message?: string }
      if (json.message) {
        translated = translateMainStreamMessage(json.message)
      }
    } catch {
      translated = translateMainStreamMessage(text)
    }

    throw new Error(
      `Main stream batch failed: ${response.status} ${translated}`
    )
  }

  return (await response.json()) as MainStreamBatchResponse
}

const storeBatch = async (
  database: MySql2Database,
  payload: MainStreamBatchResponse
) => {
  if (!payload || !Array.isArray(payload.data)) {
    const translated = payload?.message
      ? translateMainStreamMessage(payload.message)
      : undefined
    console.warn('Main stream payload missing data field', {
      ...payload,
      translatedMessage: translated
    })
    return
  }

  const rows = payload.data.flatMap((device) =>
    device.data.map((item) => ({
      deviceId: device.deviceId,
      monitorItem: item.monitorItem,
      monitorTime: item.monitorTime,
      monitorValue: item.monitorValue,
    }))
  )

  if (rows.length === 0) {
    return
  }

  await database.insert(deviceData).values(rows)
}

export const startMainStreamSync = (
  database: MySql2Database,
  intervalMs: number = hourMs
) => {
  const baseUrl = process.env.MAIN_STREAM_URL
  const devices = buildDevicesFromEnv()

  if (!baseUrl) {
    console.warn('MAIN_STREAM_URL is not set. Main stream sync disabled.')
    return
  }

  if (devices.length === 0) {
    console.warn('No main stream devices configured. Main stream sync disabled.')
    return
  }

  const runSync = async () => {
    const end = Date.now()
    const start = end - hourMs

    try {
      const payload = await fetchBatch(baseUrl, devices, start, end)
      await storeBatch(database, payload)
      console.log('Main stream sync completed successfully')
    } catch (error) {
      console.error('Main stream sync failed', error)
    }
  }
  void runSync()
  setInterval(runSync, intervalMs)
}