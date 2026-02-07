import './fields.css'

export default function Toggle({ label, value, onChange }) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      <div className="toggle-group">
        <button
          type="button"
          className={`toggle-btn ${value === true ? 'selected-yes' : ''}`}
          onClick={() => onChange(true)}
        >
          Yes
        </button>
        <button
          type="button"
          className={`toggle-btn ${value === false ? 'selected-no' : ''}`}
          onClick={() => onChange(false)}
        >
          No
        </button>
      </div>
    </div>
  )
}
