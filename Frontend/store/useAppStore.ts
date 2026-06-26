// src/store/useAppStore.ts
import { create } from 'zustand';

// กำหนดหน้าตาของโกดัง (Interface)
interface AppState {
  isMockMode: boolean;
  toggleMockMode: () => void;
}

// สร้างโกดัง
export const useAppStore = create<AppState>((set) => ({
  isMockMode: true, // ค่าเริ่มต้นให้เป็น Mock ไว้ก่อน จะได้ไม่พังตอนเน็ตหลุด
  toggleMockMode: () => set((state) => ({ isMockMode: !state.isMockMode })),
}));