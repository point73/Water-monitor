import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

function Sidebar({ date, setDate, setActivePage }) {
  return (
    <aside style={{
      width: '320px',
      backgroundColor: '#1f2937', // 사이드바 배경을 어두운 색으로 변경
      padding: '20px 10px',
      boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      flexShrink: 0,
    }}>
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* 텍스트 색상을 흰색으로 변경 */}
        <h2 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '10px', color: '#ffffff', textAlign: 'center' }}>WATER</h2>
        {/* 텍스트 색상을 밝은 회색으로 변경 */}
        <h1 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '20px', color: '#e5e7eb', textAlign: 'center' }}>
          PPAP 프로젝트
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            onClick={() => setActivePage('dashboard')} 
            style={{ backgroundColor: '#3b82f6', color: 'white', padding: '14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '20px' }}>
            대시보드 홈
          </button>
          <button 
            style={{ backgroundColor: '#3b82f6', color: 'white', padding: '14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '20px' }}>
            수질 지표별 조회
          </button>
          <button 
            onClick={() => setActivePage('timeRange')} 
            style={{ backgroundColor: '#3b82f6', color: 'white', padding: '14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '20px' }}>
            시간 범위 선택
          </button>
          <button 
            style={{ backgroundColor: '#3b82f6', color: 'white', padding: '14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '20px' }}>
            데이터 다운로드
          </button>
        </div>
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', paddingBottom: '10px' }}>
        {/* 캘린더를 감싸는 글자도 밝은 색으로 변경 */}
        <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#ffffff', marginTop: '5px', marginBottom: '10px' }}>달력</h3>
        <Calendar 
          onChange={setDate} 
          value={date} 
          calendarType="gregory" 
          style={{ maxWidth: '300px', width: '100%' }} 
        />
      </div>
    </aside>
  );
}

export default Sidebar;