import './fields.css'

export default function TimeField({ label, value, onChange }) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      <input
        type="time"
        className="time-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
