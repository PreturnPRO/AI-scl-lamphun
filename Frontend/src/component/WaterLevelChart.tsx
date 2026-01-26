import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

import styles from './WaterLevelChart.module.css';

export interface ChartData  {
  time: string;
  value: number;
};

// หลีกเลี่ยงการ import TooltipProps จาก recharts เพื่อกันเวอร์ชัน mismatch
type CustomTooltipProps = {
  active?: boolean;
  label?: string;
  payload?: Array<{ value?: number }>;
};

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const v = payload[0]?.value;
    return (
      <div className={styles.customTooltip}>
        {/* ผสม Global Class (text-caption) กับ Module Class */}
        <p className={`text-caption ${styles.tooltipTime}`}>เวลา: {label} น.</p>

        <div className={styles.tooltipValueRow}>
          <div className={styles.tooltipDot} />
          <span className={`text-data-md ${styles.tooltipValue}`}>
            {typeof v === 'number' ? v.toFixed(2) : '-'} ม.
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const WaterLevelChart: React.FC = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const publicKey = import.meta.env.VITE_TIDB_PUBLIC_KEY as string | undefined;
        const privateKey = import.meta.env.VITE_TIDB_PRIVATE_KEY as string | undefined;
        const baseUrl = import.meta.env.VITE_API_ENDPOINT as string | undefined;

        if (!publicKey || !privateKey || !baseUrl) {
          console.error('Missing .env', { hasPublic: !!publicKey, hasPrivate: !!privateKey, baseUrl });
          setError('ยังไม่ได้ตั้งค่า .env (VITE_API_URL, VITE_TIDB_PUBLIC_KEY, VITE_TIDB_PRIVATE_KEY)');
          return;
        }

        const authString = btoa(`${publicKey}:${privateKey}`);

        console.log('🔑 Auth String:', authString);
        console.log('🔗 Fetching URL:', '/api-tidb?type=water_monitor');

        // ยิงเข้า localhost ที่ path /api-tidb เดี๋ยว Vite จะส่งต่อให้เอง
        const response = await fetch(`/api-tidb?type=water_monitor`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${authString}`,
            // 'endpoint-type': 'draft', // ลองปิดบรรทัดนี้ดูก่อน
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const result = await response.json();

        // ทำให้แน่ใจว่าเป็นอาร์เรย์ก่อน .map
        let apiData: any[] = [];
        if (Array.isArray(result?.data?.rows)) apiData = result.data.rows;
        else if (Array.isArray(result?.rows)) apiData = result.rows;
        else if (Array.isArray(result)) apiData = result;

        const formattedData: ChartData[] = apiData
          .map((item: any) => {
            const tStr = item.timestamp ?? item.created_at ?? item.time;
            const t = tStr ? new Date(tStr) : null;
            const raw = item.value ?? item.level ?? item.monitor_value ?? item.y;
            const num = typeof raw === 'string' ? parseFloat(raw) : Number(raw);

            return {
              time: t && !isNaN(t.getTime())
                ? t.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
                : '-',
              value: num
            } as ChartData;
          })
          .filter(d => Number.isFinite(d.value));

        setData(formattedData);
      } catch (err) {
        console.error('Fetch Error:', err);
        setError('ไม่สามารถเชื่อมต่อข้อมูลได้');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className={`card ${styles.stateContainer}`}>
        <span className="text-default">กำลังโหลดข้อมูลจาก TiDB...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`card ${styles.stateContainer}`}>
        <span className={`text-default ${styles.errorText}`}>{error}</span>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className={`card ${styles.stateContainer}`}>
        <span className="text-default">ไม่มีข้อมูลที่แสดง</span>
      </div>
    );
  }

  return (
    <div className={`card ${styles.chartCard}`}>
      <div className={styles.header}>
        <div>
          <h3 className="text-h3" style={{ margin: 0 }}>ระดับน้ำ (Real-time)</h3>
          <p className="text-caption" style={{ margin: '4px 0 0 0' }}>ข้อมูลจาก TiDB Cloud</p>
        </div>
        <div className={styles.legend}>
           <div className={styles.legendItem}>
              <div className={`${styles.legendLine} ${styles.warning}`}></div>
              <span className="text-caption">เฝ้าระวัง</span>
           </div>
           <div className={styles.legendItem}>
              <div className={`${styles.legendLine} ${styles.critical}`}></div>
              <span className="text-caption">วิกฤต</span>
           </div>
        </div>
      </div>

      {/* ใช้ความสูงคงที่เลี่ยงปัญหา container ไม่มีความสูง */}
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0099FF" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#0099FF" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis 
            dataKey="time" axisLine={false} tickLine={false} 
            tick={{ fontFamily: 'IBM Plex Mono', fontSize: 12, fill: '#6B7280' }} dy={10}
          />
          <YAxis 
            axisLine={false} tickLine={false} 
            tick={{ fontFamily: 'IBM Plex Mono', fontSize: 12, fill: '#6B7280' }} domain={['auto', 'auto']} 
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={3.5} stroke="#F59E0B" strokeDasharray="5 5" />
          <ReferenceLine y={4.5} stroke="#EF4444" strokeDasharray="5 5" />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#0099FF" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorValue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};