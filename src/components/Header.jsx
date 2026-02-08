import { useState } from 'react'
import { useData } from '../context/DataContext.jsx'
import {
  formatDateHeader,
  addDays,
  isToday,
  toDateKey,
} from '../utils/dates.js'
import Calendar from './Calendar.jsx'
import './Header.css'

export default function Header() {
  const { state, setSelectedDate, toggleTheme, clearAll } = useData()
  const { selectedDate, settings } = state
  const [showCalendar, setShowCalendar] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  return (
    <>
      <header className="header">
        <div className="header-nav">
          <button
            className="header-nav-btn"
            onClick={() => setSelectedDate(addDays(selectedDate, -1))}
            aria-label="Previous day"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            className="header-date"
            onClick={() => setShowCalendar(true)}
            aria-label="Open calendar"
          >
            {formatDateHeader(selectedDate)}
          </button>
          <button
            className="header-nav-btn"
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            aria-label="Next day"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <div className="header-actions">
          <button
            className={`header-today-btn ${isToday(selectedDate) ? 'hidden' : ''}`}
            onClick={() => setSelectedDate(toDateKey(new Date()))}
          >
            Today
          </button>
          <button
            className="header-nav-btn"
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Settings"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </button>
        </div>
      </header>

      {showSettings && (
        <div
          className="settings-dropdown"
          onClick={() => setShowSettings(false)}
        >
          <div className="settings-menu" onClick={e => e.stopPropagation()}>
            <button className="settings-item" onClick={toggleTheme}>
              {settings.theme === 'light' ? 'Dark mode' : 'Light mode'}
            </button>
            <button
              className="settings-item settings-item--danger"
              onClick={() => {
                if (
                  window.confirm(
                    'Delete all tracked data? This cannot be undone.'
                  )
                ) {
                  clearAll()
                  setShowSettings(false)
                }
              }}
            >
              Clear all data
            </button>
          </div>
        </div>
      )}

      {showCalendar && (
        <Calendar
          selectedDate={selectedDate}
          onSelect={date => {
            setSelectedDate(date)
            setShowCalendar(false)
          }}
          onClose={() => setShowCalendar(false)}
        />
      )}
    </>
  )
}
