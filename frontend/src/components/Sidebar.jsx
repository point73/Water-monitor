// src/components/Sidebar.jsx
import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

function Sidebar({ date, setDate }) {
  return (
    <aside style={{
      width: '280px',
      backgroundColor: '#e0f2f7', // 밝은 하늘색 계열로 변경했습니다.
      padding: '20px 10px',
      boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      flexShrink: 0,
    }}>
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h2 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '10px', color: '#333', textAlign: 'center' }}>WATER</h2>
        <h1 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '20px', color: '#555', textAlign: 'center' }}>
          PPAP 프로젝트
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button style={{ backgroundColor: '#3b82f6', color: 'white', padding: '14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '20px' }}>대시보드 홈</button>
          <button style={{ backgroundColor: '#3b82f6', color: 'white', padding: '14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '20px' }}>수질 지표별 조회</button>
          <button style={{ backgroundColor: '#3b82f6', color: 'white', padding: '14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '20px' }}>시간 범위 선택</button>
          <button style={{ backgroundColor: '#3b82f6', color: 'white', padding: '14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '20px' }}>데이터 다운로드</button>
        </div>
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', paddingBottom: '10px' }}>
        <p style={{ fontSize: '18px', color: '#666' }}>날짜 범위 표시 (월, 일별)</p>
        <p style={{ fontSize: '18px', color: '#666' }}>캘린더 날짜 선택</p>
        <Calendar onChange={setDate} value={date} calendarType="gregory" style={{ maxWidth: '260px', width: '100%' }} />
        <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#333', marginTop: '5px' }}>달력</h3>
      </div>
    </aside>
  );
}

export default Sidebar;
