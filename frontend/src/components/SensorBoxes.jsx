import React from 'react';
// 👇 심플한 느낌 유지하면서 의미 맞춘 아이콘들
import { WiRaindrop } from 'react-icons/wi';        // 물방울(용존산소)
import { RiFlaskLine, RiLeafLine } from 'react-icons/ri'; // 플라스크(pH), 잎사귀(BOD=생물학적)
import { FaVial } from 'react-icons/fa6';           // 바이알(COD=화학적)

import '../styles/components.css';

function SensorBoxes({ selectedSensorData }) {
  // 각 센서 라벨/아이콘/단위
  const sensorConfig = {
    ph:       { label: 'pH',  Icon: RiFlaskLine, unit: 'pH' },   // 산도 → 플라스크
    doValue:  { label: 'DO',  Icon: WiRaindrop, unit: 'mg/L' },  // 용존산소 → 물방울
    bod:      { label: 'BOD', Icon: RiLeafLine, unit: 'mg/L' },  // 생물학적 → 잎사귀
    cod:      { label: 'COD', Icon: FaVial, unit: 'mg/L' },      // 화학적 → 바이알
  };

  const thresholds = {
    ph: { normal: { min: 6.5, max: 8.5 }, warning: { min: 6.0, max: 9.0 } },
    doValue: { normal: 5.0, warning: 3.0 },
    bod: { normal: 3.0, warning: 6.0 },
    cod: { normal: 4.0, warning: 8.0 },
  };

  const getStatus = (key, value) => {
    if (value === undefined || value === null) return { text: '데이터 없음', color: '#A0AEC0' };

    switch (key) {
      case 'ph':
        if (value >= thresholds.ph.normal.min && value <= thresholds.ph.normal.max)
          return { text: '정상', color: '#48BB78' };
        if (value >= thresholds.ph.warning.min && value <= thresholds.ph.warning.max)
          return { text: '주의', color: '#F59E0B' };
        return { text: '위험', color: '#F56565' };

      case 'doValue':
        if (value >= thresholds.doValue.normal) return { text: '정상', color: '#48BB78' };
        if (value >= thresholds.doValue.warning) return { text: '주의', color: '#F59E0B' };
        return { text: '위험', color: '#F56565' };

      case 'bod':
        if (value <= thresholds.bod.normal) return { text: '정상', color: '#48BB78' };
        if (value <= thresholds.bod.warning) return { text: '주의', color: '#F59E0B' };
        return { text: '위험', color: '#F56565' };

      case 'cod':
        if (value <= thresholds.cod.normal) return { text: '정상', color: '#48BB78' };
        if (value <= thresholds.cod.warning) return { text: '주의', color: '#F59E0B' };
        return { text: '위험', color: '#F56565' };

      default:
        return { text: '-', color: '#A0AEC0' };
    }
  };

  return (
    <div className="sensor-grid">
      {Object.keys(sensorConfig).map((key) => {
        const sensorValue = selectedSensorData ? selectedSensorData[key] : undefined;
        const status = getStatus(key, sensorValue);
        const { Icon, label, unit } = sensorConfig[key];

        const displayValue =
          typeof sensorValue === 'number' ? sensorValue.toFixed(1) : '-';

        return (
          <div
            key={key}
            className="sensor-box"
            style={{
              backgroundColor: `${status.color}1A`,
              border: `1px solid ${status.color}40`,
              borderLeft: `5px solid ${status.color}`,
            }}
          >
            <div className="sensor-header">
              <div className="sensor-icon">
                <Icon size={28} color={status.color} />
              </div>
              <p className="sensor-name">{label}</p>
            </div>
            <p className="sensor-value" style={{ color: status.color }}>
              {displayValue}
              <span className="sensor-unit">{unit}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default SensorBoxes;
