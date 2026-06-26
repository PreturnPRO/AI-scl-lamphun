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

        // Get stations data from API
        const stationDevices = await DeviceService.getStations();

        if (stationDevices.length === 0) {
          console.warn("No stations found");
          setStationName("No stations");
          setWaterHistory([]);
          setRainHistory([]);
          setProbData([]);
          setIsLoading(false);
          return;
        }

        // Set station name from first station
        setStationName(stationDevices[0].stationName || "Station");
        setStations(stationDevices);

        // Group devices by station and query data
        const waterData: DeviceRangeData[] = [];
        const rainData: DeviceRangeData[] = [];

        await Promise.all(
          stationDevices.map(async (device) => {
            const data = await DeviceService.getHistory(
              device.deviceId,
              secretKey,
              device.monitorItem,
              startTime,
              endTime
            );

            // Separate water vs rain by monitorItem
            const lowerMonitor = device.monitorItem.toLowerCase();
            if (lowerMonitor.includes('water') || lowerMonitor.includes('nw_')) {
              waterData.push(...data);
            } else {
              rainData.push(...data);
            }
          })
        );

        console.log('Water data count:', waterData.length);
        console.log('Rain data count:', rainData.length);

        setWaterHistory(waterData);
        setRainHistory(rainData);
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
