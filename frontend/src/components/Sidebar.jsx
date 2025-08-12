import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/components.css';

function Sidebar({ date, setDate, setActivePage }) {
  return (
    <aside className="sidebar-container">
      <div className="sidebar-content">
        <h2 className="sidebar-main-title">WATER</h2>
        <h1 className="sidebar-sub-title">PPAP 프로젝트</h1>
        <div className="sidebar-buttons">
          <button 
            onClick={() => setActivePage('dashboard')} 
            className="sidebar-button"
          >
            대시보드 홈
          </button>
          <button 
            onClick={() => setActivePage('standards')} 
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
        </div>
      </div>
      
      <div className="calendar-section">
        <h3 className="calendar-title">달력</h3>
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