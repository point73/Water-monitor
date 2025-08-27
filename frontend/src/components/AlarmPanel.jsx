import React from 'react';
import '../styles/components.css'; // 스타일시트 공유

// 아이콘 (SVG)
const DangerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);


function AlarmPanel({ alarms = [], onClose }) {
  // API 연동 전 UI 확인을 위한 더미 데이터
  const dummyAlarms = [
    { id: 'dummy-1', level: 'danger', name: '한강-서울 (샘플)', value: 45.2 },
    { id: 'dummy-2', level: 'danger', name: '낙동강-부산 (샘플)', value: 48.9 },
    { id: 'dummy-3', level: 'warning', name: '금강-대전 (샘플)', value: 60.1 },
    { id: 'dummy-4', level: 'warning', name: '영산강-광주 (샘플)', value: 65.7 },
    { id: 'dummy-5', level: 'warning', name: '한강-경기 (샘플)', value: 70.3 },
  ];

  // 외부에서 받은 alarms 데이터가 비어있을 경우 더미 데이터를 사용
  const displayAlarms = alarms.length > 0 ? alarms : dummyAlarms;

  const dangerAlarms = displayAlarms.filter(a => a.level === 'danger');
  const warningAlarms = displayAlarms.filter(a => a.level === 'warning');

  return (
    <aside className="alarm-panel-container">
      <div className="alarm-panel-header">
        <h3 className="alarm-panel-title">위험/경고 알람</h3>
        <button onClick={onClose} className="alarm-panel-close-btn">
          &times;
        </button>
      </div>
      <div className="alarm-panel-content">
        {/* 위험 섹션 */}
        <section className="alarm-section">
          <h4 className="alarm-section-title danger">
            <DangerIcon /> 위험 ({dangerAlarms.length}건)
          </h4>
          <ul className="alarm-list">
            {dangerAlarms.length > 0 ? (
              dangerAlarms.map(alarm => (
                <li key={alarm.id} className="alarm-item danger">
                  <span className="alarm-item-name">{alarm.name}</span>
                  <span className="alarm-item-value">{alarm.value}</span>
                </li>
              ))
            ) : (
              <li className="alarm-item-empty">위험 알람이 없습니다.</li>
            )}
          </ul>
        </section>

        {/* 경고 섹션 */}
        <section className="alarm-section">
          <h4 className="alarm-section-title warning">
            <WarningIcon /> 경고 ({warningAlarms.length}건)
          </h4>
          <ul className="alarm-list">
            {warningAlarms.length > 0 ? (
              warningAlarms.map(alarm => (
                <li key={alarm.id} className="alarm-item warning">
                  <span className="alarm-item-name">{alarm.name}</span>
                  <span className="alarm-item-value">{alarm.value}</span>
                </li>
              ))
            ) : (
              <li className="alarm-item-empty">경고 알람이 없습니다.</li>
            )}
          </ul>
        </section>
      </div>
    </aside>
  );
}

export default AlarmPanel;
