import https from 'https';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config({ path: __dirname + '/../.env' });

// --- CONFIGURATION & TYPES ---
const RUHRTEC_HOST = 'www.ruhrtec.cn';
const RUHRTEC_PATH = '/http/v2/query/device/latest';

type DeviceDataRaw = { monitorItem?: string; monitorTime?: string; monitorValue?: string | number; };
type RuhrtecDeviceBlock = { deviceId?: string | number; name?: string; data?: DeviceDataRaw[]; };
type RuhrtecResponse = { data?: RuhrtecDeviceBlock[]; [key: string]: unknown; };

// --- GLOBAL DATABASE POOL ---
// Create once and reuse to prevent "Connection Lost" errors
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 4000,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: 'aiscl',
  ssl: process.env.DB_ENABLE_SSL ? { rejectUnauthorized: false } : undefined,
  connectionLimit: 10,
  enableKeepAlive: true,        // Critical fix for TiDB Cloud
  keepAliveInitialDelay: 10000, // Sends keep-alive every 10s
  idleTimeout: 60000,           // Closes idle connections before server times them out
});

async function fetchDeviceLatest(deviceId: string, deviceSecretKey: string, monitorItem: string): Promise<RuhrtecResponse> {
  const payload = JSON.stringify({ deviceId, deviceSecretKey, monitorItem });
  const options: https.RequestOptions = {
    hostname: RUHRTEC_HOST,
    path: RUHRTEC_PATH,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } 
        catch { reject(new Error('JSON Parse Error')); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function ensureTable() {
  const createSql = `
    CREATE TABLE IF NOT EXISTS monitor_data (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      monitor_type ENUM('water', 'rain') NOT NULL,
      device_id VARCHAR(64) NOT NULL,
      device_name VARCHAR(255),
      monitor_time BIGINT,
      monitor_value VARCHAR(128),
      inserted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_type_time (monitor_type, monitor_time)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  await pool.query(createSql);

  // Views for your Data Service
  await pool.query(`CREATE OR REPLACE VIEW water_monitor_data AS SELECT * FROM monitor_data WHERE monitor_type = 'water'`);
  await pool.query(`CREATE OR REPLACE VIEW rain_monitor_data AS SELECT * FROM monitor_data WHERE monitor_type = 'rain'`);
}

async function saveMonitorEntry(monitorType: string, deviceId: string, deviceName: string | undefined, entry: DeviceDataRaw) {
  const insertSql = `
    INSERT INTO monitor_data (monitor_type, device_id, device_name, monitor_item, monitor_time, monitor_value, inserted_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  // 1. Create a Date object from the API string
  const date = entry.monitorTime ? new Date(entry.monitorTime) : null;

  // 2. Add hours based on monitor type: water +12, rain +5
  if (date) {
    const hourOffset = monitorType === 'water' ? 12 : 5;
    date.setHours(date.getHours() + hourOffset);
  }
  
  // Better Date handling: ensure string format matches SQL DATETIME
  const formattedTime = date 
    ? date.toISOString().replace('T', ' ').slice(0, 19)
    : null;

  const params = [
    monitorType,
    deviceId,
    deviceName || null,
    entry.monitorItem || null,
    formattedTime,
    entry.monitorValue,
    new Date(), // inserted_at
  ];
  await pool.execute(insertSql, params);
}

export async function syncOnce() {
  try {
    await ensureTable();

    const monitors = [
      { type: 'water', id: process.env.WATER_MONITOR_ID, secret: process.env.WATER_MONITOR_SECRET_KEY, item: process.env.WATER_MONITOR_NAME },
      { type: 'rain', id: process.env.RAIN_MONITOR_ID, secret: process.env.RAIN_MONITOR_SECRET_KEY, item: process.env.RAIN_MONITOR_NAME },
    ].filter(m => m.id && m.secret);

    await Promise.allSettled(monitors.map(async (monitor) => {
      try {
        const resp = await fetchDeviceLatest(monitor.id!, monitor.secret!, monitor.item!);
        if (!resp.data) return;

        for (const block of resp.data) {
          for (const entry of (block.data || [])) {
            if (!entry.monitorTime) continue;
            await saveMonitorEntry(monitor.type, String(block.deviceId || monitor.id), block.name, entry);
          }
        }
        console.log(`[${monitor.type.toUpperCase()}] Sync complete.`);
      } catch (err) {
        console.error(`[${monitor.type.toUpperCase()}] Error:`, err);
      }
    }));
  } catch (err) {
    console.error('Critical Sync Error:', err);
  }
}

// --- SCHEDULING ---
const run = async () => {
    console.log(`[${new Date().toISOString()}] Starting Sync...`);
    await syncOnce();
    console.log('Next sync in 9 minutes.');
};

run();
setInterval(run, 9 * 60000);