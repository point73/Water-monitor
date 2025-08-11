import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

function Sidebar({ date, setDate, setActivePage }) {
  return (
    <aside style={{
      width: '360px', 
      backgroundColor: '#1f2937',
      // --- 여기를 수정했습니다 (전체적인 간격 조정) ---
      padding: '30px 20px',
      boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '25px', // 전체 섹션 사이의 간격
      flexShrink: 0,
    }}>
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h2 style={{ fontSize: '45px', fontWeight: 'bold', marginBottom: '15px', color: '#ffffff', textAlign: 'center' }}>WATER</h2>
        <h1 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '25px', color: '#e5e7eb', textAlign: 'center' }}>
          PPAP 프로젝트
        </h1>
        {/* --- 여기를 수정했습니다 (버튼 사이 간격) --- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
      {/* --- 여기를 수정했습니다 (달력 부분 간격) --- */}
<div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', paddingBottom: '10px' }}>
  <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#ffffff', marginTop: '5px', marginBottom: '10px' }}>달력</h3>
  <style>{`
    /* 달력 전체 스타일 - 높이 고정 */
    .react-calendar {
      width: 100%;
      max-width: 445px;
      height: 360px; /* 고정 높이 설정 */
      border: 1px solid #C4C4C4;
      border-radius: 0.5rem;
      padding: 3% 5%;
      background-color: white;
      font-size: 16px;
      display: flex;
      flex-direction: column;
    }

    /* 달력 본체 영역 높이 고정 */
    .react-calendar__viewContainer {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .react-calendar__month-view {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .react-calendar__month-view__days {
      flex: 1;
      display: grid !important;
      grid-template-rows: repeat(6, 1fr); /* 항상 6주 표시 */
      grid-template-columns: repeat(7, 1fr);
    }

    /* 네비게이션 스타일 */
    .react-calendar__navigation {
      border-bottom: 1px solid #DFDFDF;
      margin-bottom: 10px;
    }

    .react-calendar__navigation__label__labelText {
      color: #3F3F3F;
    }

    .react-calendar__navigation__arrow {
      background-color: transparent;
      color: #7C97FE;
    }

    .react-calendar__navigation button {
      font-weight: 600;
      font-size: 1rem;
    }

    .react-calendar__navigation button:hover {
      background-color: transparent;
      color: #7C97FE;
    }

    .react-calendar__navigation button:active,
    .react-calendar__navigation button:focus {
      background-color: transparent;
      outline: none;
    }

    .react-calendar__navigation__label {
      flex-grow: 0 !important;
    }

    /* 요일 헤더 스타일 */
    .react-calendar__month-view__weekdays {
      margin-bottom: 10px;
    }

    .react-calendar__month-view__weekdays abbr {
      text-decoration: none;
      font-weight: 700;
      font-size: 16px;
    }

    .react-calendar__month-view__weekdays__weekday abbr {
      color: #424242;
    }

    /* 일요일 헤더에 빨간 폰트 */
    .react-calendar__month-view__weekdays__weekday--weekend abbr[title="일요일"] {
      color: #FF0000;
    }

    /* 토요일 헤더에 파란 폰트 */
    .react-calendar__month-view__weekdays__weekday--weekend abbr[title="토요일"] {
      color: #2E7AF2;
    }

    /* 날짜 타일 스타일 */
    .react-calendar__tile {
      font-size: 18px;
      font-weight: 600;
      position: relative;
      background-color: transparent !important;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      height: 100%; /* 그리드 셀에 맞춰 높이 조정 */
    }

    .react-calendar__tile abbr {
      color: #424242;
    }

    /* 토요일 날짜들에 파란 폰트 - 우선순위 높임 */
    .react-calendar__tile.saturday-date,
    .react-calendar__tile.saturday-date abbr {
      color: #2E7AF2 !important;
    }
    .react-calendar__tile.saturday-date:hover {
      background-color: #e6f3ff !important;
    }
    .react-calendar__tile.saturday-date:hover abbr {
      color: #2E7AF2 !important;
    }

    /* 일요일 날짜들에 빨간 폰트 - 우선순위 높임 */
    .react-calendar__tile.sunday-date,
    .react-calendar__tile.sunday-date abbr {
      color: #FF0000 !important;
    }
    .react-calendar__tile.sunday-date:hover {
      background-color: #ffe6e6 !important;
    }
    .react-calendar__tile.sunday-date:hover abbr {
      color: #FF0000 !important;
    }

    /* 이전 달과 다음 달의 날짜 숫자들의 색상 변경 */
    .react-calendar__month-view__days__day--neighboringMonth abbr {
      color: #BDBDBD !important;
    }

    /* 이전 달과 다음 달의 날짜는 주말 색상 무시 */
    .react-calendar__month-view__days__day--neighboringMonth.saturday-date,
    .react-calendar__month-view__days__day--neighboringMonth.saturday-date abbr,
    .react-calendar__month-view__days__day--neighboringMonth.sunday-date,
    .react-calendar__month-view__days__day--neighboringMonth.sunday-date abbr {
      color: #BDBDBD !important;
    }

    .react-calendar__month-view__days__day--neighboringMonth.saturday-date:hover,
    .react-calendar__month-view__days__day--neighboringMonth.sunday-date:hover {
      background-color: #f0f0f0 !important;
    }

    /* 선택된 날짜 스타일 */
    .react-calendar__tile--active {
      background: none;
      color: #424242;
    }

    /* 오늘 날짜 스타일 */
    .react-calendar__tile--now {
      background: none;
      position: relative;
      z-index: 1;
    }

    .react-calendar__tile--now abbr {
      color: white !important;
      position: relative;
      z-index: 2;
    }

    /* 오늘 날짜 원형 배경 - 중앙 정렬 수정 */
    .react-calendar__tile--now::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 32px;
      height: 32px;
      margin: auto;
      border-radius: 50%;
      background-color: #7C97FE;
      z-index: 1;
    }

    /* 호버 효과 */
    .react-calendar__tile:hover {
      background-color: #f0f0f0;
    }
  `}</style>
  <Calendar 
    onChange={setDate} 
    value={date} 
    calendarType="gregory" 
    style={{ maxWidth: '100%', width: '100%' }} 
    formatDay={(locale, date) => date.getDate().toString()}
    showNeighboringMonth={true} // 빈 칸 채우기
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