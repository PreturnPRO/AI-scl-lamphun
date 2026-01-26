import express, { Request, Response } from 'express';
import { Database, SensorData } from './database';
import dotenv from 'dotenv';
import axios from 'axios';

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

app.get('/api/device/latest', async (req: Request, res: Response) => {
    const { id, key, monitor_name } = req.query;
    try {
        const response = await axios.post(
            'https://www.ruhrtec.cn/http/v2/query/device/latest',
            {
                deviceId: id,
                deviceSecretKey: key,
                monitorItem: monitor_name
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
                    monitorItem: monitor_name as string,
                    monitorTime: new Date(monitorTime),
                    monitorValue: Number(monitorValue)
                };
                await db.saveSensorData(id as string,
                    sensorData
                );
                res.json({ monitorValue, monitorTime });
                return;
            }
        }

        res.json({ error: 'No data found' });
        return;
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch device data', details: error instanceof Error ? error.message : error });
    }
});



app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
