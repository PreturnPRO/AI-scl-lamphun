// src/pages/DashboardPage.tsx

import { useState, useCallback, useEffect, useMemo } from "react";
import StationTable from "../components/Dashboard-StationTable";
import {
  DeviceService,
  type DeviceRangeData,
  type RainProbabilityData,
  type StationDeviceInfo,
} from "../service/deviceService";
import WaterLevelChart from "../components/WaterLevelChart";
import DataCard from "../components/DataCard";
import type { StationData } from "../components/MapView";
import styles from "../styles/DashboradPage.module.css";

const DashboardPage = () => {
  // State ข้อมูลสถานี
  const [stationName, setStationName] = useState<string>("Loading Station...");
  const [stations, setStations] = useState<StationDeviceInfo[]>([]);
  const [waterHistory, setWaterHistory] = useState<DeviceRangeData[]>([]);
  const [rainHistory, setRainHistory] = useState<DeviceRangeData[]>([]);
  const [probData, setProbData] = useState<RainProbabilityData[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleDataUpdate = useCallback((water: number, rain: number) => {
    setWaterValue(water.toFixed(3));
    setRainValue(rain.toFixed(3));
  }, []);

  const [waterValue, setWaterValue] = useState<string>("---");
  const [rainValue, setRainValue] = useState<string>("---");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const secretKey =
          import.meta.env.VITE_API_deviceSecretKey || "MOCK_KEY";
        const endTime = Date.now();
        const startTime = endTime - 24 * 60 * 60 * 1000;

        console.log("🟢 Mode: Using Real API (USE_MOCK_DATA=false)");

        // Get latest stations data (includes latest values for DataCards)
        const latestData = await DeviceService.getLatestStations();

        if (latestData.length === 0) {
          console.warn("No stations found");
          setStationName("No stations");
          setWaterHistory([]);
          setRainHistory([]);
          setProbData([]);
          setIsLoading(false);
          return;
        }

        // Set station name from first station
        setStationName(latestData[0].stationName || "Station");

        // Use monitorValue from /stations/latest for DataCards (most recent reading per device)
        const waterDevice = latestData.find(s =>
          s.monitorItem?.toLowerCase().includes('nw_') ||
          s.monitorItem?.toLowerCase().includes('water') ||
          s.monitorItem?.toLowerCase().includes('wl')
        );
        const rainDevice = latestData.find(s =>
          !s.monitorItem?.toLowerCase().includes('nw_') &&
          !s.monitorItem?.toLowerCase().includes('water') &&
          !s.monitorItem?.toLowerCase().includes('wl')
        );
        console.log('[DataCard] waterDevice:', waterDevice?.monitorItem, '=', waterDevice?.monitorValue);
        console.log('[DataCard] rainDevice:', rainDevice?.monitorItem, '=', rainDevice?.monitorValue);

        // Get unique stations
        const uniqueStationsMap = new Map<string, StationDeviceInfo>();
        for (const item of latestData) {
          if (!uniqueStationsMap.has(item.stationId)) {
            uniqueStationsMap.set(item.stationId, {
              stationId: item.stationId,
              stationName: item.stationName,
              latitude: item.latitude,
              longitude: item.longitude,
              deviceId: item.deviceId,
              deviceName: item.deviceName,
              monitorItem: item.monitorItem
            });
          }
        }
        setStations(Array.from(uniqueStationsMap.values()));

        // Group devices by station and query data for charts
        const waterData: DeviceRangeData[] = [];
        const rainData: DeviceRangeData[] = [];

        await Promise.all(
          latestData.map(async (device) => {
            const data = await DeviceService.getHistory(
              device.deviceId,
              secretKey,
              device.monitorItem,
              startTime,
              endTime
            );

            console.log(`Device ${device.deviceId} (${device.monitorItem}): ${data.length} records`);

            const lowerMonitor = device.monitorItem.toLowerCase();
            const isWaterDevice = lowerMonitor.includes('water') || lowerMonitor.includes('nw_') || lowerMonitor.includes('wl');

            if (isWaterDevice) {
              waterData.push(...data);
              console.log(`  → Added to waterData`);
            } else {
              rainData.push(...data);
              console.log(`  → Added to rainData`);
            }
          })
        );

        console.log('Water data count:', waterData.length);
        if (waterData.length > 0) {
          console.log('Water sample values:', waterData.slice(0, 3).map(d => d.monitorValue));
        }
        console.log('Rain data count:', rainData.length);

        setWaterHistory(waterData);
        setRainHistory(rainData);

        const avgWater = waterData.length > 0
          ? (waterData.reduce((sum, d) => sum + (parseFloat(d.monitorValue) || 0), 0) / waterData.length).toFixed(3)
          : '---';
        const avgRain = rainData.length > 0
          ? (rainData.reduce((sum, d) => sum + (parseFloat(d.monitorValue) || 0), 0) / rainData.length).toFixed(3)
          : '---';

        console.log('[DataCard] waterData entries:', waterData.length, 'sample:', waterData.slice(0, 3).map(d => ({ v: d.monitorValue, t: d.monitorTime })));
        console.log('[DataCard] avgWater:', avgWater, 'avgRain:', avgRain, '| latest waterDevice monitorValue:', waterDevice?.monitorValue);

        // Use /stations/latest monitorValue directly (most recent reading per device)
        const displayWater = (waterDevice?.monitorValue && waterDevice.monitorValue !== '')
          ? parseFloat(waterDevice.monitorValue).toFixed(3)
          : (avgWater !== '---' ? avgWater : '---');
        const displayRain = (rainDevice?.monitorValue && rainDevice.monitorValue !== '')
          ? parseFloat(rainDevice.monitorValue).toFixed(3)
          : (avgRain !== '---' ? avgRain : '---');

        setWaterValue(displayWater);
        setRainValue(displayRain);

        setProbData([]);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Map stations from API response
  const stationList: StationData[] = useMemo(() => {
    if (stations.length === 0) {
      return [];
    }

    // Group by stationId and take first entry for each station
    const uniqueStations = new Map<string, StationData>();
    for (const s of stations) {
      if (!uniqueStations.has(s.stationId)) {
        uniqueStations.set(s.stationId, {
          id: s.stationId,
          name: s.stationName,
          lat: parseFloat(s.latitude) || 18.586,
          lng: parseFloat(s.longitude) || 99.023,
          status: "active"
        });
      }
    }

    return Array.from(uniqueStations.values());
  }, [stations]);

  return (
    <main className={styles.container}>
      {/* --- ส่วนบน: สถิติ และ เปอร์เซ็นต์ฝน --- */}
      <section className={styles.topSection}>
        <div className={styles.topLeft}>
          <div className={styles.cardGrid}>
            <DataCard
              title="จำนวนสถานี"
              value={stationList.length}
              unit="สถานี"
              theme="blue"
            />
            <DataCard
              title="ระดับน้ำ"
              value={waterValue}
              unit="เมตร"
              theme="orange"
            />
            <DataCard
              title="ปริมาณน้ำฝนสะสม"
              value={rainValue}
              unit="มิลลิเมตร/ชั่วโมง"
              theme="orange"
            />
          </div>
          <div className={styles.controlBar}>
            <select className={styles.selectInput}>
              <option>ประเภทข้อมูล</option>
            </select>
            <select className={styles.selectInput}>
              <option>ตั้งค่ากราฟ</option>
            </select>
          </div>
        </div>

        <div className={styles.topRight}>
          <div className={styles.probTableCard}>
            <div className={styles.probHeader}>เปอร์เซ็นต์การเกิดฝน</div>
            <div className={styles.probGrid}>
              <div className={styles.probTimeCol}>time</div>
              <div>Sun</div>
              <div>M</div>
              <div>Tu</div>
              <div>W</div>
              <div>Th</div>
              <div>Fr</div>
              <div>St</div>

              {probData.map((row, idx) => (
                <span key={idx} className={styles.probRowContents}>
                  <div className={styles.probTimeCol}>{row.time}</div>
                  <div>{row.sun}</div>
                  <div>{row.mon}</div>
                  <div>{row.tue}</div>
                  <div>{row.wed}</div>
                  <div>{row.thu}</div>
                  <div>{row.fri}</div>
                  <div>{row.sat}</div>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- ส่วนกลาง: กราฟเต็มจอ --- */}
      <section className={styles.chartSection}>
        <div className={styles.chartWrapper}>
          <WaterLevelChart
            waterData={waterHistory}
            rainData={rainHistory}
            onDataUpdate={handleDataUpdate}
          />
        </div>
      </section>

      {/* --- ส่วนล่าง: ตารางข้อมูล --- */}
      <section className={styles.tableSection}>
        <StationTable
          waterData={waterHistory}
          rainData={rainHistory}
          isLoading={isLoading}
          stationName={stationName}
        />
      </section>
    </main>
  );
};

export default DashboardPage;
