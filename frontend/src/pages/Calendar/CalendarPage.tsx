import { useState, useEffect } from "react";
import { TopBar } from "../../components/Topbar/TopBar.tsx";
import { LeftPanel } from "../../components/LeftBar/LeftPanel.tsx";
import "./CalendarPage.css";
import { api } from "../../api.ts";
import {useNavigate} from "react-router-dom";


interface CalendarItem {
  id: number;
  title: string;
  createdAt: string;
  type: 'note' | 'folder';
}

function CalendarPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<Record<string, CalendarItem[]>>({});

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;

        const response = await api.get<CalendarItem[]>('/notes/calendar', {
          params: { year, month }
        });

        const grouped = response.data.reduce<Record<string, CalendarItem[]>>((acc, note) => {
          if (!note.createdAt) return acc;

          const dateKey = note.createdAt.split('T')[0];

          if (!acc[dateKey]) {
            acc[dateKey] = [];
          }

          acc[dateKey].push(note);
          return acc;
        }, {});

        setCalendarData(grouped);
      } catch (error) {
        console.error("Не вдалося завантажити дані календаря:", error);
      }
    };
    fetchCalendarData();
  }, [currentDate]);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);

    let firstDayIndex = getFirstDayOfMonth(year, month);
    firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const days = [];
    const today = new Date();

    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const hasItems = calendarData[dateString]?.length > 0;

      const isToday = i === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      const isSelected = i === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();

      let classNames = 'calendar-day';
      if (isToday) classNames += ' today';
      if (hasItems) classNames += ' has-items';
      if (isSelected) classNames += ' selected';

      days.push(
        <div
          key={i}
          className={classNames}
          onClick={() => setSelectedDate(new Date(year, month, i))}
        >
          {i}
        </div>
      );
    }
    return days;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const selectedDateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const selectedDayItems = calendarData[selectedDateString] || [];

  return (
    <div>
      <TopBar onToggleMenu={toggleSidebar} onSearchChange={setSearchQuery} />

      <div className="content">
        <LeftPanel
          isOpen={isSidebarOpen}
          onSelectMenuItem={() => {
            if (window.innerWidth <= 768 && isSidebarOpen) setIsSidebarOpen(false);
          }}
        />

        <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="calendar-page-layout">
            <div className="calendar-main glass-panel">
              <div className="calendar-header">
                <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                <div className="calendar-nav">
                  <button onClick={handlePrevMonth} className="nav-btn">←</button>
                  <button onClick={handleNextMonth} className="nav-btn">→</button>
                </div>
              </div>

              <div className="calendar-grid">
                {weekDays.map(day => (
                  <div key={day} className="weekday">{day}</div>
                ))}
                {renderCalendarDays()}
              </div>
            </div>

            <div className="calendar-side-panel glass-panel">
              <h3>{monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}</h3>

              <div className="items-list">
                {selectedDayItems.length > 0 ? (
                  selectedDayItems.map((item: CalendarItem) => (
                    <div key={`${item.type}-${item.id}`} className="item-card" onClick={() => {
                      if (item.type === 'folder') {
                        navigate(`/folders/${item.id}`);
                      } else {
                        navigate(`/notes/${item.id}`);
                      }
                    }}>
                      <span className="item-icon">
                        {item.type === 'folder' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                        )}
                      </span>
                      <span className="item-title" title={item.title}>
                        {item.title}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="no-items">Немає записів на цей день</p>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

export default CalendarPage;