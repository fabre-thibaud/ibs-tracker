import { useData } from '../context/DataContext.jsx'
import './DayView.css'

function severityClass(val, max = 10) {
  const ratio = val / max
  if (ratio <= 0.3) return 'severity-low'
  if (ratio <= 0.6) return 'severity-med'
  return 'severity-high'
}

function MealCard({ entry, onClick }) {
  return (
    <div className="entry-card entry-card--meal" onClick={onClick}>
      <div className="entry-card-header">
        <span className="entry-card-type">{entry.type || 'Meal'}</span>
        <span className="entry-card-time">{entry.time}</span>
      </div>
      <div className="entry-card-body">
        {entry.content || 'No description'}
      </div>
      <div className="entry-card-tags">
        {entry.portion && <span className="entry-card-tag">{entry.portion}</span>}
        {entry.highFat && <span className="entry-card-tag entry-card-tag--alert">High Fat</span>}
      </div>
    </div>
  )
}

function PainCard({ entry, onClick }) {
  return (
    <div className="entry-card entry-card--pain" onClick={onClick}>
      <div className="entry-card-header">
        <span className="entry-card-type">Pain Episode</span>
        <span className="entry-card-time">{entry.time}</span>
      </div>
      <div className="entry-card-body">
        {entry.location}
        {entry.severity != null && (
          <>
            {' — '}
            <span className={`severity-badge ${severityClass(entry.severity)}`}>
              {entry.severity}/10
            </span>
          </>
        )}
      </div>
      <div className="entry-card-tags">
        {entry.character && <span className="entry-card-tag">{entry.character}</span>}
        {entry.duration && <span className="entry-card-tag">{entry.duration} min</span>}
      </div>
    </div>
  )
}

function BowelCard({ entry, onClick }) {
  const bristolLabel = entry.bristolType ? `Bristol Type ${entry.bristolType}` : 'Bowel Movement'
  return (
    <div className="entry-card entry-card--bowel" onClick={onClick}>
      <div className="entry-card-header">
        <span className="entry-card-type">{bristolLabel}</span>
        <span className="entry-card-time">{entry.time}</span>
      </div>
      <div className="entry-card-body">
        {entry.color || 'No color noted'}
      </div>
      <div className="entry-card-tags">
        {entry.blood && <span className="entry-card-tag entry-card-tag--alert">Blood</span>}
        {entry.mucus && <span className="entry-card-tag entry-card-tag--alert">Mucus</span>}
        {entry.urgency && <span className="entry-card-tag entry-card-tag--alert">Urgent</span>}
        {entry.completeEvacuation === true && <span className="entry-card-tag entry-card-tag--good">Complete</span>}
        {entry.completeEvacuation === false && <span className="entry-card-tag">Incomplete</span>}
      </div>
    </div>
  )
}

function SummaryCard({ summary, onClick }) {
  return (
    <div className="summary-card" onClick={onClick}>
      <div className="summary-card-header">Daily Summary</div>
      <div className="summary-metrics">
        {summary.feeling != null && (
          <div className="summary-metric">
            <span className="summary-metric-label">Feeling</span>
            <span className="summary-metric-value">{summary.feeling}/10</span>
          </div>
        )}
        {summary.energy != null && (
          <div className="summary-metric">
            <span className="summary-metric-label">Energy</span>
            <span className="summary-metric-value">{summary.energy}/10</span>
          </div>
        )}
        {summary.sleep != null && (
          <div className="summary-metric">
            <span className="summary-metric-label">Sleep</span>
            <span className="summary-metric-value">{summary.sleep}/10</span>
          </div>
        )}
        {summary.stress != null && (
          <div className="summary-metric">
            <span className="summary-metric-label">Stress</span>
            <span className="summary-metric-value">{summary.stress}/10</span>
          </div>
        )}
      </div>
      {summary.notes && (
        <div className="summary-notes">"{summary.notes}"</div>
      )}
    </div>
  )
}

export default function DayView({ onEditEntry }) {
  const { state, getDayData } = useData()
  const dayData = getDayData(state.selectedDate)

  // Merge all timed entries and sort chronologically
  const timedEntries = [
    ...dayData.meals.map((e) => ({ ...e, entryType: 'meal' })),
    ...dayData.pain.map((e) => ({ ...e, entryType: 'pain' })),
    ...dayData.bowel.map((e) => ({ ...e, entryType: 'bowel' })),
  ].sort((a, b) => (a.time || '').localeCompare(b.time || ''))

  const isEmpty = timedEntries.length === 0 && !dayData.summary

  return (
    <div className="day-view">
      {dayData.summary && (
        <SummaryCard
          summary={dayData.summary}
          onClick={() => onEditEntry('summary', dayData.summary)}
        />
      )}

      {timedEntries.map((entry) => {
        const mapType = { meal: 'meals', pain: 'pain', bowel: 'bowel' }
        switch (entry.entryType) {
          case 'meal':
            return <MealCard key={entry.id} entry={entry} onClick={() => onEditEntry('meal', entry)} />
          case 'pain':
            return <PainCard key={entry.id} entry={entry} onClick={() => onEditEntry('pain', entry)} />
          case 'bowel':
            return <BowelCard key={entry.id} entry={entry} onClick={() => onEditEntry('bowel', entry)} />
          default:
            return null
        }
      })}

      {isEmpty && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div className="empty-state-title">No entries yet</div>
          <div className="empty-state-desc">Tap + to log a meal, symptom, or summary</div>
        </div>
      )}
    </div>
  )
}
