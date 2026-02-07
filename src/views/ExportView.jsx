import { useState, useMemo } from 'react'
import { useData } from '../context/DataContext.jsx'
import { generateWeeklySummary, generateCSV, downloadFile } from '../utils/export.js'
import { formatWeekRange, addDays } from '../utils/dates.js'
import './ExportView.css'

export default function ExportView() {
  const { state } = useData()
  const [weekDate, setWeekDate] = useState(state.selectedDate)
  const [toast, setToast] = useState(null)

  const weekLabel = formatWeekRange(weekDate)
  const summaryText = useMemo(() => generateWeeklySummary(state.data, weekDate), [state.data, weekDate])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(summaryText)
      showToast('Copied to clipboard')
    } catch {
      showToast('Failed to copy')
    }
  }

  function downloadText() {
    downloadFile(summaryText, `ibs-week-${weekDate}.txt`, 'text/plain')
    showToast('Downloaded text file')
  }

  function downloadCSV() {
    const csv = generateCSV(state.data)
    downloadFile(csv, `ibs-data-export.csv`, 'text/csv')
    showToast('Downloaded CSV file')
  }

  return (
    <div className="export-view">
      <div className="week-nav">
        <button className="week-nav-btn" onClick={() => setWeekDate(addDays(weekDate, -7))} aria-label="Previous week">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span className="week-nav-title">{weekLabel}</span>
        <button className="week-nav-btn" onClick={() => setWeekDate(addDays(weekDate, 7))} aria-label="Next week">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      <div className="export-section">
        <div className="export-section-title">Share with Doctor</div>
        <div className="export-buttons">
          <button className="export-btn export-btn--primary" onClick={copyToClipboard}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy Weekly Summary
          </button>
          <button className="export-btn" onClick={downloadText}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download as Text
          </button>
        </div>
      </div>

      <div className="export-section">
        <div className="export-section-title">Raw Data</div>
        <div className="export-buttons">
          <button className="export-btn" onClick={downloadCSV}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            Download All Data as CSV
          </button>
        </div>
      </div>

      <div className="export-section">
        <div className="export-section-title">Preview</div>
        <pre className="export-preview">{summaryText}</pre>
      </div>

      {toast && <div className="export-toast">{toast}</div>}
    </div>
  )
}
