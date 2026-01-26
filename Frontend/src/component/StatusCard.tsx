//import { useState, useEffect } from 'react';
import './StatusCard.css';

// กำหนดประเภทสถานะที่เป็นไปได้
export type StationStatus = "normal" | "warning" | "critical";

export class Station {
    constructor(
        public id: string,
        public name: string,
        public waterLevel: number,
        public rainfall: number,
        private _status: StationStatus // ใช้ private เพื่อความปลอดภัย
    ) {}

    // Method สำหรับดึงชื่อสถานะมาใช้
    public getStatus(): StationStatus {
        return this._status;
    }

    // Method สำหรับดึงรหัสสีตามตัวแปร CSS ที่คุณมีในรูป (เช่น --color-status-critical)
    public getStatusColorVariable(): string {
        switch (this._status) {
            case "critical": return "var(--color-status-critical, #EF4444)";
            case "warning": return "#E67E22";
            case "normal": return "#2ECC71";
            default: return "#FFF";
        }
    }
}



interface StatusCardProps {
    station: Station;
}

const StatusCard = ({ station }: StatusCardProps) => {
    // ดึงค่าสีจาก OOP Method
    const statusColor = station.getStatusColorVariable();

    return (
        <div 
            className="status-card" 
            style={{ '--current-status-color': statusColor } as React.CSSProperties}>
            <div className="header">
                <span>STATION: NAME</span>
                <h3>{station.name}</h3>
            </div>
            
            <div className="data-row">
                <div className="item">
                    <p>ระดับน้ำ</p>
                    <h2 className='water-level'>{station.waterLevel} <small>เมตร</small></h2>
                </div>
                <div className="item">
                    <p>ปริมาณน้ำฝน</p>
                    <h2 className='rain-level'>{station.rainfall} <small>มม./ชม.</small></h2>
                </div>
            </div>
        </div>
    );
};

export default StatusCard;
