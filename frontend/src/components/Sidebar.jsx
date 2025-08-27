import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/components.css';
import logo from '../assets/logo.png'; // 로고 이미지를 import 합니다.

// App.jsx에서 알람 패널을 제어할 onToggleAlarms 함수를 prop으로 받습니다.
function Sidebar({ date, setDate, setActivePage, onToggleAlarms }) {
  return (
    <aside className="sidebar-container">
      <div className="sidebar-content">
        {/* 이미지 크기를 늘리고 가운데 정렬하도록 style 속성을 수정했습니다. */}
        <img 
          src={logo} 
          alt="PPAP Logo" 
          className="sidebar-logo" 
          style={{ 
            width: '180px', 
            display: 'block', 
            margin: '10px auto 20px' 
          }} 
        />

        
        <div className="sidebar-buttons">
          <button 
            onClick={() => setActivePage('dashboard')} 
            className="sidebar-button"
          >
            대시보드 홈
          </button>
          <button 
            onClick={() => setActivePage('qualityStandards')} 
            className="sidebar-button"
          >
            수질 환경 기준
          </button>
          <button 
            onClick={() => setActivePage('timeRange')} 
            className="sidebar-button"
          >
            자료 조회
          </button>
          {/* ▼▼▼ 새로운 알람 버튼 ▼▼▼ */}
          <button 
            onClick={onToggleAlarms} 
            className="sidebar-button alarm-button"
          >
            알림
          </button>
          {/* ▲▲▲ 새로운 알람 버튼 ▲▲▲ */}
        </div>
      </div>
      
      <div className="calendar-section">
        <Calendar 
          onChange={setDate} 
          value={date} 
          calendarType="gregory" 
          style={{ maxWidth: '100%', width: '100%' }} 
          formatDay={(locale, date) => date.getDate().toString()}
          showNeighboringMonth={true}
          tileClassName={({ date, view }) => {
            if (view === 'month') {
              if (date.getDay() === 6) { // 토요일
                return 'saturday-date';
              } else if (date.getDay() === 0) { // 일요일
                return 'sunday-date';
              }
            }
            return null;
          }}
        />
      </div>
    </aside>
  );
}

export default Sidebar;
