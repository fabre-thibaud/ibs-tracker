import { useState } from 'react'
import { useData } from '../context/DataContext.jsx'
import { toDateKey, fromDateKey, getCalendarMonth } from '../utils/dates.js'
import './Calendar.css'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

export default function Calendar({ selectedDate, onSelect, onClose }) {
  const { state } = useData()
  const initial = fromDateKey(selectedDate)
  const [viewYear, setViewYear] = useState(initial.getFullYear())
  const [viewMonth, setViewMonth] = useState(initial.getMonth())

  const days = getCalendarMonth(viewYear, viewMonth)
  const todayKey = toDateKey(new Date())

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1)
      setViewMonth(11)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1)
      setViewMonth(0)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  return (
    <div className="calendar-overlay" onClick={onClose}>
      <div className="calendar" onClick={e => e.stopPropagation()}>
        <div className="calendar-header">
          <button
            className="calendar-nav-btn"
            onClick={prevMonth}
            aria-label="Previous month"
          >
            <svg
              width="20"
              height="20"
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
          <span className="calendar-title">
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button
            className="calendar-nav-btn"
            onClick={nextMonth}
            aria-label="Next month"
          >
            <svg
              width="20"
              height="20"
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

        <div className="calendar-weekdays">
          {WEEKDAYS.map(d => (
            <span key={d} className="calendar-weekday">
              {d}
            </span>
          ))}
        </div>

        <div className="calendar-days">
          {days.map(dateKey => {
            const d = fromDateKey(dateKey)
            const isOtherMonth = d.getMonth() !== viewMonth
            const isSelected = dateKey === selectedDate
            const isToday = dateKey === todayKey
            const hasData =
              state.data[dateKey] &&
              (state.data[dateKey].meals.length > 0 ||
                state.data[dateKey].pain.length > 0 ||
                state.data[dateKey].bowel.length > 0 ||
                state.data[dateKey].summary)

            const classes = [
              'calendar-day',
              isOtherMonth && 'other-month',
              isSelected && 'selected',
              isToday && 'today',
              hasData && 'has-data',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <button
                key={dateKey}
                className={classes}
                onClick={() => onSelect(dateKey)}
              >
                {d.getDate()}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
