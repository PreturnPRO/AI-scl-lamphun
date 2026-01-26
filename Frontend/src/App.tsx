import { useState } from 'react'
import { WaterLevelChart } from './component/WaterLevelChart';
import{StatusCard} from './component/StatusCard';
import{DataCard} from './component/DataCard';
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
      <div>
        <DataCard/>
      </div>
    <div>
      {/*<StatusCard />*/}
    </div>
      {/* --- พื้นที่วางกราฟ --- */}
      <div style={{ display: 'grid', gap: '24px' }}>
        <WaterLevelChart />
      </div>

    </div>
  );
}

export default App