import { useState, useEffect } from 'react';
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



type statusData ={
    //time:Date;\
    stationName:string;
    sensorId:string;
    waterLavel:number;
    rainfall:number;
}
    
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