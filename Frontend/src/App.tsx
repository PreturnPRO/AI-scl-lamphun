import { useState } from 'react'
// ✅ แก้ไข: เอาปีกกาออกให้แล้วครับ (เพราะใช้ export default)
import { WaterLevelChart }from './component/WaterLevelChart'; 
import DataCard from './component/DataCard';

function App() {
  return (
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

      {/* --- ส่วนแสดงผล DataCard (เรียงแนวนอน 3 ใบ) --- */}
      {/* ✅ วิธีแก้: เอาการ์ดทั้ง 3 ใบมาใส่ใน div ตัวเดียวกันครับ */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '40px' }}>
        
        {/* ใบที่ 1 */}
        <DataCard 
            title="จำนวนสถานี" 
            value={1} 
            unit="สถานี" 
            theme="orange" 
        />

        {/* ใบที่ 2 */}
        <DataCard 
            title="ระดับน้ำ" 
            value="150.250" 
            unit="เมตร" 
            theme="blue" 
        />

        {/* ใบที่ 3 */}
        <DataCard 
            title="ปริมาณน้ำฝนสะสม" 
            value="50.568" 
            unit="มิลลิเมตร/ชม." 
            theme="blue" 
        />
        
      </div>

      {/* --- พื้นที่วางกราฟ --- */}
      <div style={{ display: 'grid', gap: '24px' }}>
        <WaterLevelChart />
      </div>

    </div>
  );
}

export default App