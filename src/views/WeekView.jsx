import { useState } from 'react'
import { useData } from '../context/DataContext.jsx'
import { getWeekDays, formatWeekRange, addDays } from '../utils/dates.js'
import './WeekView.css'

export default function WeekView() {
  const { state } = useData()
  const [weekDate, setWeekDate] = useState(state.selectedDate)

  const days = getWeekDays(weekDate)
  const weekRange = formatWeekRange(weekDate)

  // Aggregate
  const meals = [],
    pain = [],
    bowel = [],
    beverages = [],
    summaries = []
  for (const day of days) {
    const d = state.data[day]
    if (!d) continue
    meals.push(...d.meals)
    pain.push(...d.pain)
    bowel.push(...d.bowel)
    beverages.push(...(d.beverages || []))
    if (d.summary) summaries.push(d.summary)
  }

  const highFatCount = meals.filter(m => m.highFat).length
  const avgPain =
    pain.length > 0
      ? (pain.reduce((s, p) => s + (p.severity || 0), 0) / pain.length).toFixed(
          1
        )
      : null

  const painLocations = {}
  for (const p of pain) {
    if (p.location)
      painLocations[p.location] = (painLocations[p.location] || 0) + 1
  }

  const bristolDist = {}
  for (const b of bowel) {
    if (b.bristolType)
      bristolDist[b.bristolType] = (bristolDist[b.bristolType] || 0) + 1
  }

  const avgFeeling =
    summaries.length > 0
      ? (
          summaries.reduce((s, d) => s + (d.feeling || 0), 0) / summaries.length
        ).toFixed(1)
      : null
  const avgEnergy =
    summaries.length > 0
      ? (
          summaries.reduce((s, d) => s + (d.energy || 0), 0) / summaries.length
        ).toFixed(1)
      : null
  const sleepSummaries = summaries.filter(d => d.sleep)
  const avgSleep =
    sleepSummaries.length > 0
      ? (
          sleepSummaries.reduce((s, d) => s + d.sleep, 0) /
          sleepSummaries.length
        ).toFixed(1)
      : null

  const caffeineCount = beverages.filter(b => b.caffeine).length
  const alcoholCount = beverages.filter(b => b.alcohol).length

  const hasData =
    meals.length > 0 ||
    pain.length > 0 ||
    bowel.length > 0 ||
    beverages.length > 0 ||
    summaries.length > 0

  function prevWeek() {
    setWeekDate(addDays(weekDate, -7))
  }

  function nextWeek() {
    setWeekDate(addDays(weekDate, 7))
  }

  return (
    <div className="week-view">
      <div className="week-nav">
        <button
          className="week-nav-btn"
          onClick={prevWeek}
          aria-label="Previous week"
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
        <span className="week-nav-title">{weekRange}</span>
        <button
          className="week-nav-btn"
          onClick={nextWeek}
          aria-label="Next week"
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

      {!hasData && <div className="week-empty">No data for this week.</div>}

      {hasData && (
        <>
          <div className="week-section">
            <div className="week-section-title">Meals</div>
            <div className="week-stat">
              <span className="week-stat-label">Total logged</span>
              <span className="week-stat-value">{meals.length}</span>
            </div>
            <div className="week-stat">
              <span className="week-stat-label">High-fat meals</span>
              <span className="week-stat-value">{highFatCount}</span>
            </div>
          </div>

          {pain.length > 0 && (
            <div className="week-section">
              <div className="week-section-title">Pain Episodes</div>
              <div className="week-stat">
                <span className="week-stat-label">Total episodes</span>
                <span className="week-stat-value">{pain.length}</span>
              </div>
              <div className="week-stat">
                <span className="week-stat-label">Average severity</span>
                <span className="week-stat-value">{avgPain}/10</span>
              </div>
              {Object.keys(painLocations).length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div className="week-list">
                    {Object.entries(painLocations).map(([loc, count]) => (
                      <div key={loc} className="week-list-item">
                        {loc} ({count}x)
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {bowel.length > 0 && (
            <div className="week-section">
              <div className="week-section-title">Bowel Movements</div>
              <div className="week-stat">
                <span className="week-stat-label">Total</span>
                <span className="week-stat-value">{bowel.length}</span>
              </div>
              {Object.keys(bristolDist).length > 0 && (
                <div className="week-list" style={{ marginTop: 8 }}>
                  {Object.entries(bristolDist)
                    .sort((a, b) => Number(a[0]) - Number(b[0]))
                    .map(([type, count]) => (
                      <div key={type} className="week-list-item">
                        Type {type}: {count} times
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {beverages.length > 0 && (
            <div className="week-section">
              <div className="week-section-title">Beverages</div>
              <div className="week-stat">
                <span className="week-stat-label">Total logged</span>
                <span className="week-stat-value">{beverages.length}</span>
              </div>
              <div className="week-stat">
                <span className="week-stat-label">With caffeine</span>
                <span className="week-stat-value">{caffeineCount}</span>
              </div>
              <div className="week-stat">
                <span className="week-stat-label">With alcohol</span>
                <span className="week-stat-value">{alcoholCount}</span>
              </div>
            </div>
          )}

          {summaries.length > 0 && (
            <div className="week-section">
              <div className="week-section-title">Daily Metrics (averages)</div>
              {avgFeeling && (
                <div className="week-stat">
                  <span className="week-stat-label">Feeling</span>
                  <span className="week-stat-value">{avgFeeling}/10</span>
                </div>
              )}
              {avgEnergy && (
                <div className="week-stat">
                  <span className="week-stat-label">Energy</span>
                  <span className="week-stat-value">{avgEnergy}/10</span>
                </div>
              )}
              {avgSleep && (
                <div className="week-stat">
                  <span className="week-stat-label">Sleep</span>
                  <span className="week-stat-value">{avgSleep}/10</span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
