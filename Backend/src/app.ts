import express, { Request, Response } from 'express';
import { Database } from './database';
import dotenv from 'dotenv';
import { Device, DeviceInfo } from './device';

dotenv.config({ path: __dirname + '/../.env' });

const app = express();
const port = 3000;

const db: Database = new Database(
    process.env.DB_HOST || 'localhost',
    process.env.DB_PORT ? Number(process.env.DB_PORT) : 4000,
    process.env.DB_USERNAME || 'root',
    process.env.DB_PASSWORD || '',
    process.env.DB_NAME || 'database',
    process.env.DB_ENABLE_SSL === 'true'
);

db.init().then(() => {
    console.log('Database initialized successfully');
}).catch((err) => {
    console.error('Database initialization failed:', err.message);
    console.error('Please ensure MySQL is running on', `${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT ? Number(process.env.DB_PORT) : 4000}`);
});

const monitors: Set<Device> = new Set<Device>();

function loadMonitors() {
    db.getDeviceList().then((devices: DeviceInfo[]) => {
        devices.forEach((device) => {
            const monitor = new Device({
                deviceId: device.deviceId,
                deviceSecretKey: device.deviceSecretKey,
                customName: device.customName || undefined,
                deviceLocation: (device.deviceLocation && device.deviceLocation.latitude !== null && device.deviceLocation.longitude !== null) ? {
                    latitude: device.deviceLocation.latitude,
                    longitude: device.deviceLocation.longitude
                } : undefined,
                monitorItem: device.monitorItem
            });
            monitors.add(monitor);
        });
        console.log(`Loaded ${monitors.size} monitors from database.`);
    }).catch((err) => {
        console.error('Failed to load devices from database:', err.message);
    });
}

loadMonitors();

app.get('/api/device/latest', async (req: Request, res: Response) => {
    const { id } = req.query;
    const device = Array.from(monitors).find(d => d.getInfo().deviceId === id);
    if (device) {
        return device.getSensorData(req, res);
    } else {
        return res.status(404).json({ error: 'Device not found' });
    }
});

app.post('/api/device/register', express.json(), async (req: Request, res: Response) => {
    const deviceInfo = req.body;
    try {
        const deviceInfoTyped: DeviceInfo = {
            deviceId: deviceInfo.id,
            deviceSecretKey: deviceInfo.key,
            customName: deviceInfo.customName || undefined,
            deviceLocation: (deviceInfo.deviceLocation && deviceInfo.deviceLocation.latitude !== null && deviceInfo.deviceLocation.longitude !== null) ? {
                latitude: deviceInfo.deviceLocation.latitude,
                longitude: deviceInfo.deviceLocation.longitude
            } : undefined,
            monitorItem: deviceInfo.monitor_name
        }
        await db.saveDeviceInformation(deviceInfoTyped);
        const monitor = new Device(deviceInfoTyped);
        monitors.add(monitor);
        return res.json({ message: 'Device registered successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to register device', details: error instanceof Error ? error.message : error });
    }
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
