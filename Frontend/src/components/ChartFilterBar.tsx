import React from "react";
import styles from "../styles/ChartFilterBar.module.css";

export type ChartFilterType = "all" | "water_level" | "rain_fall";

interface ChartFilterBarProps {
  value: ChartFilterType;
  onChange: (value: ChartFilterType) => void;
}

const ChartFilterBar: React.FC<ChartFilterBarProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className={styles.container}>
      <select
        className={styles.selectInput}
        value={value}
        onChange={(e) => onChange(e.target.value as ChartFilterType)}
      >
        <option value="all">ทั้งหมด</option>
        <option value="water_level">ระดับน้ำ</option>
        <option value="rain_fall">ปริมาณน้ำฝนสะสม</option>
      </select>
    </div>
  );
};

export default ChartFilterBar;
