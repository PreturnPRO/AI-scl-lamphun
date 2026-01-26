import mysql, { Pool } from 'mysql2/promise';
import { BaseDevice, DeviceInfo, SensorData } from './device';

class Database {
    private pool: Pool;

    constructor(host: string, port: number, user: string, password: string, database: string, ssl: boolean, enableKeepAlive: boolean = true, keepAliveInitialDelay: number = 10000, idleTimeout: number = 60000) {
        this.pool = mysql.createPool({
            host: host,
            port: port,
            user: user,
            password: password,
            database: database,
            ssl: ssl ? { rejectUnauthorized: true } : { rejectUnauthorized: false },
            connectionLimit: 10,
            enableKeepAlive: enableKeepAlive,
            keepAliveInitialDelay: keepAliveInitialDelay,
            idleTimeout: idleTimeout,
        });
    }

    async init() {
        const createDeviceSql = `
            CREATE TABLE IF NOT EXISTS monitor_device (
                id INT PRIMARY KEY AUTO_INCREMENT,
                device_id VARCHAR(64) NOT NULL UNIQUE,
                device_secret_key VARCHAR(255) NOT NULL,
                custom_name VARCHAR(255),
                monitor_item VARCHAR(64) NOT NULL,
                latitude DOUBLE,
                longitude DOUBLE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;
        const createDataSql = `
            CREATE TABLE IF NOT EXISTS monitor_data (
                id INT PRIMARY KEY AUTO_INCREMENT,
                device_id VARCHAR(64) NOT NULL,
                monitor_item VARCHAR(64) NOT NULL,
                monitor_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                monitor_value DOUBLE,
                FOREIGN KEY (device_id) REFERENCES monitor_device(device_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;
        await this.pool.query(createDeviceSql);
        await this.pool.query(createDataSql);
    }

    async saveDeviceInformation(device: DeviceInfo) {
        const insertSql = `
            INSERT INTO monitor_device (device_id, device_secret_key, custom_name, latitude, longitude, monitor_item)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                device_secret_key = VALUES(device_secret_key),
                monitor_item = VALUES(monitor_item),
                custom_name = VALUES(custom_name),
                latitude = VALUES(latitude),
                longitude = VALUES(longitude);
        `;
        const values = [
            device.deviceId,
            device.deviceSecretKey,
            device.customName || null,
            device.deviceLocation ? device.deviceLocation.latitude : null,
            device.deviceLocation ? device.deviceLocation.longitude : null,
            device.monitorItem
        ];
        await this.pool.query(insertSql, values);
    }

    async saveSensorData(deviceId: string, data: SensorData) {
        const insertSql = `
            INSERT INTO monitor_data (device_id, monitor_item, monitor_time, monitor_value)
            VALUES (?, ?, ?, ?);
        `;
        const values = [
            deviceId,
            data.monitorItem,
            data.monitorTime,
            data.monitorValue
        ];
        await this.pool.query(insertSql, values);
    }

    async getDeviceList(): Promise<BaseDevice[]> {
        const selectSql = `SELECT device_id, device_secret_key, monitor_item FROM monitor_device;`;
        const [rows] = await this.pool.query(selectSql);
        return (rows as unknown[]).map(row => {
            const typedRow = row as { device_id: string; device_secret_key: string, monitor_item: string };
            return {
                deviceId: typedRow.device_id,
                deviceSecretKey: typedRow.device_secret_key,
                monitorItem: typedRow.monitor_item
            };
        });
    }
}

export { Database }