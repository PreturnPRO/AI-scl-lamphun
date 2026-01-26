import { useState } from 'react'
import { WaterLevelChart } from './component/WaterLevelChart';
import{StatusCard} from './component/StatusCard';
function App() {
  return (
    // ใช้ class 'container' จาก index.css เพื่อจัดกึ่งกลาง
    <div className="container" style={{ marginTop: '40px', paddingBottom: '40px' }}>
      
      {/* --- ส่วนหัวข้อ --- */}
      <div style={{ marginBottom: '32px' }}>
        <h1 className="text-h1" style={{ color: 'var(--color-brand)', marginBottom: '8px' }}>
          Lamphun Smart Water
        </h1>
        <p className="text-default" style={{ color: 'var(--text-secondary)' }}>
          ระบบบริหารจัดการน้ำและแจ้งเตือนภัยพิบัติอัจฉริยะ อบจ.ลำพูน
        </p>
      </div>
    <div>
      <StatusCard />
    </div>
      {/* --- พื้นที่วางกราฟ --- */}
      <div style={{ display: 'grid', gap: '24px' }}>
        
        {/* เรียกใช้ Component กราฟที่เราทำไว้ */}
        <WaterLevelChart />
        {/* (อนาคต) เดี๋ยวเราจะเอากราฟน้ำฝน หรือตารางมาวางต่อท้ายตรงนี้ */}
        {/* <RainFallChart /> */}
        
      </div>

    </div>
  );
}

export default App
