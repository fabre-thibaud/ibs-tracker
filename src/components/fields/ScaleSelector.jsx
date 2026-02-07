import './fields.css'

function getSeverityClass(n, max) {
  const ratio = n / max
  if (ratio <= 0.3) return 'severity-low'
  if (ratio <= 0.6) return 'severity-med'
  return 'severity-high'
}

export default function ScaleSelector({ label, min = 1, max = 10, value, onChange }) {
  const nums = []
  for (let i = min; i <= max; i++) nums.push(i)

  return (
    <div className="field">
      <label className="field-label">{label}</label>
      <div className="scale-selector">
        {nums.map((n) => (
          <button
            key={n}
            type="button"
            className={`scale-btn ${value === n ? 'selected' : ''} ${getSeverityClass(n, max)}`}
            onClick={() => onChange(n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}
