import { useState } from 'react'
import { useData } from '../context/DataContext.jsx'
import { formatDateHeader, addDays, isToday, toDateKey } from '../utils/dates.js'
import Calendar from './Calendar.jsx'
import './Header.css'

export default function Header() {
  const { state, setSelectedDate, toggleTheme, clearAll } = useData()
  const { selectedDate, settings } = state
  const [showCalendar, setShowCalendar] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [apiKey, setApiKey] = useState(() => {
    try {
      const saved = localStorage.getItem('ibs-tracker-settings')
      return saved ? (JSON.parse(saved).usdaApiKey || '') : ''
    } catch {
      return ''
    }
  })

  function saveApiKey() {
    try {
      const saved = localStorage.getItem('ibs-tracker-settings')
      const settings = saved ? JSON.parse(saved) : {}
      settings.usdaApiKey = apiKey.trim()
      localStorage.setItem('ibs-tracker-settings', JSON.stringify(settings))
      setShowApiKeyModal(false)
    } catch (error) {
      console.error('Failed to save API key:', error)
    }
  }

  return (
    <>
      <header className="header">
        <div className="header-nav">
          <button
            className="header-nav-btn"
            onClick={() => setSelectedDate(addDays(selectedDate, -1))}
            aria-label="Previous day"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
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
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          </button>
        </div>
      </header>

      {showSettings && (
        <div className="settings-dropdown" onClick={() => setShowSettings(false)}>
          <div className="settings-menu" onClick={(e) => e.stopPropagation()}>
            <button className="settings-item" onClick={toggleTheme}>
              {settings.theme === 'light' ? 'Dark mode' : 'Light mode'}
            </button>
            <button
              className="settings-item"
              onClick={() => {
                setShowApiKeyModal(true)
                setShowSettings(false)
              }}
            >
              USDA API Key
            </button>
            <button
              className="settings-item settings-item--danger"
              onClick={() => {
                if (window.confirm('Delete all tracked data? This cannot be undone.')) {
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
          onSelect={(date) => {
            setSelectedDate(date)
            setShowCalendar(false)
          }}
          onClose={() => setShowCalendar(false)}
        />
      )}

      {showApiKeyModal && (
        <div className="modal-overlay" onClick={() => setShowApiKeyModal(false)}>
          <div className="modal-content api-key-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>USDA API Key</h2>
              <button className="modal-close" onClick={() => setShowApiKeyModal(false)} aria-label="Close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Enter your free USDA FoodData Central API key to enable food autocomplete.
                <br />
                <a href="https://fdc.nal.usda.gov/api-key-signup/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--meal-color)' }}>
                  Sign up for a free API key →
                </a>
              </p>
              <input
                type="text"
                className="api-key-input"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveApiKey()}
              />
            </div>
            <div className="modal-footer">
              <button className="button button--secondary" onClick={() => setShowApiKeyModal(false)}>
                Cancel
              </button>
              <button className="button button--primary" onClick={saveApiKey}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
