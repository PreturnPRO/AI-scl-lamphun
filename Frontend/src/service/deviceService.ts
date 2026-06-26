
export interface DeviceLatestResponse {
  code: number;
  monitorValue: string;
  monitorTime: string;
}

export interface DeviceRangeData {
  monitorValue: string;
  monitorTime: string;
}

export interface DeviceRangeResponse {
  code: number;
  data: DeviceRangeData[];
}


export interface DeviceInfoResponse {
  monitorName: string;
  customName: string;
  warningLevel: number;
  deviceLocation: {
    latitude: string;
    longitude: string;
  };
}

export interface RainProbabilityData {
  time: string;
  sun: string;
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
}

const API_BASE_URL = '/api/v2/device';

const getHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// แก้ไขฟังก์ชัน handleResponse ให้สะอาด (ลบตัวแปรที่ไม่ใช้ทิ้ง)
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  return response.json();
};

export const DeviceService = {
  
  // ใช้ _ นำหน้าตัวแปรที่จำเป็นต้องรับมาแต่ไม่ได้ใช้ในฟังก์ชันนี้
  getLatest: async (_deviceId: string, _deviceSecretKey: string, _monitorItem: string): Promise<DeviceLatestResponse> => {
    const response = await fetch(`${API_BASE_URL}/latest`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ _deviceId, _deviceSecretKey, _monitorItem }),
    });
    return handleResponse(response);
  },

  getHistory: async (
    _deviceId: string, 
    _deviceSecretKey: string, 
    _monitorItem: string,
    _start: number, 
    _end: number
  ): Promise<DeviceRangeData[]> => {
    // นัทแนะนำว่าถ้าฟังก์ชันนี้ยังไม่ได้เขียน Logic ยิง API จริง 
    // ให้เรียกใช้ Mock ไปก่อน เพื่อให้ Build ผ่านครับ
    return MockDeviceService.getHistory(_deviceId, _deviceSecretKey, _monitorItem, _start, _end);
  },

  getStationInfo: async (deviceId: string): Promise<DeviceInfoResponse> => {
    const response = await fetch('/api/v2/device/info', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ deviceId }),
    });
    return handleResponse(response);
  },

  getRainProbability: async (): Promise<RainProbabilityData[]> => {
    return MockDeviceService.getRainProbability();
  }
};

export const MockDeviceService = {
  // ใส่ _ นำหน้า deviceId เพราะไม่ได้ใช้ใน Logic ของ Mock
  getStationInfo: async (_deviceId: string): Promise<DeviceInfoResponse> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      monitorName: "MOCK-001",
      customName: "Mockup Station (ลำพูน)",
      warningLevel: 1, 
      deviceLocation: {
        latitude: "18.575",
        longitude: "99.008"
      }
    };
  },

  // ใส่ _ นำหน้าตัวแปรที่ไม่ได้ใช้ใน Mock Logic
  getHistory: async (
    _deviceId: string, 
    _deviceSecretKey: string, 
    monitorItem: string, 
    _start: number, 
    end: number // 'end' มีการใช้ในลูป เลยไม่ต้องใส่ _
  ): Promise<DeviceRangeData[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const mockData: DeviceRangeData[] = [];
    const oneHour = 60 * 60 * 1000;
    
    for (let i = 0; i < 24; i++) {
      const time = end - (i * oneHour);
      
      let value = 0;
      if (monitorItem === "water_level") {
         value = 4.5 + Math.random(); 
      } else {
         value = Math.random() > 0.7 ? Math.random() * 20 : 0; 
      }

      mockData.push({
        monitorTime: new Date(time).toISOString(),
        monitorValue: value.toFixed(2)
      });
    }

    return mockData;
  },

  // ... (ส่วนที่เหลือคงเดิม) ...
  getRainProbability: async (): Promise<RainProbabilityData[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
        { time: '09:00', sun: '00', mon: '00', tue: '00', wed: '00', thu: '00', fri: '00', sat: '00' },
        { time: '10:00', sun: '00', mon: '00', tue: '00', wed: '00', thu: '00', fri: '00', sat: '00' },
        { time: '11:00', sun: '00', mon: '00', tue: '00', wed: '00', thu: '00', fri: '00', sat: '00' },
        { time: '12:00', sun: '00', mon: '00', tue: '00', wed: '00', thu: '00', fri: '00', sat: '00' },
    ];
  }
};

// 1. สร้างตัวแปร Global ไว้ในไฟล์นี้เพื่อคุมทั้งโปรเจค
let USE_MOCK_DATA = false; // ปรับเป็น false เพื่อใช้ API จริง

export const setMode = (isMock: boolean) => {
    USE_MOCK_DATA = isMock;
    console.log(`System Mode changed to: ${isMock ? 'MOCK' : 'REAL API'}`);
};

// 2. สร้าง Service Wrapper ที่ตัดสินใจแทนเรา
export const DataProvider = {
    getStationInfo: async (deviceId: string) => {
        return USE_MOCK_DATA 
            ? MockDeviceService.getStationInfo(deviceId) 
            : DeviceService.getStationInfo(deviceId);
    },
    getHistory: async (deviceId: string, key: string, item: string, start: number, end: number) => {
        return USE_MOCK_DATA 
            ? MockDeviceService.getHistory(deviceId, key, item, start, end)
            : DeviceService.getHistory(deviceId, key, item, start, end);
    }
};