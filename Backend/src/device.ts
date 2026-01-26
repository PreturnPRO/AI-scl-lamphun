import { Request, Response } from 'express';
import axios from "axios";

interface BaseDevice { // for api parameters
    deviceId: string;
    deviceSecretKey: string;
    monitorItem: string;
    start?: number;
    end?: number;
}

interface SensorData { // reference from api response data[]
    monitorItem: string;
    monitorTime: Date;
    monitorValue: number;
}

interface DeviceInfo extends BaseDevice { // from requirements
    customName?: string;
    // FOR GIS (GPS COORDINATES)
    deviceTimeZone?: number;
    deviceLocation?: {
        latitude: number;
        longitude: number;
    };
}

class Device {
    private info: DeviceInfo;
    
    constructor(info: DeviceInfo) {
        if (!info.deviceTimeZone) {
            info.deviceTimeZone = 7;
        }
        this.info = info;
    }

    getInfo(): DeviceInfo {
        return this.info;
    }

    async getSensorData(req: Request, res: Response): Promise<Response> {
        const { id } = req.query;
        try {
            const response = await axios.post(
                'https://www.ruhrtec.cn/http/v2/query/device/latest',
                {
                    deviceId: id,
                    deviceSecretKey: this.info.deviceSecretKey,
                    monitorItem: this.info.monitorItem
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data?.data && Array.isArray(response.data.data)) {
                const deviceData = response.data.data.find((item: any) => item.data.length > 0);
                if (deviceData?.data[0]) {
                    const { monitorValue, monitorTime } = deviceData.data[0];
                    const sensorData: SensorData = {
                        monitorItem: this.info.monitorItem,
                        monitorTime: new Date(monitorTime),
                        monitorValue: Number(monitorValue)
                    };
                    return res.json(sensorData);
                }
            }

            return res.json({ error: 'No data found' });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch device data', details: error instanceof Error ? error.message : error });
        }
    }
}

export { BaseDevice, SensorData, DeviceInfo, Device }