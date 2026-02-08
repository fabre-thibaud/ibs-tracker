import './fields.css'

export default function OptionButtons({ label, options, value, onChange }) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      <div className="option-buttons">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`option-btn ${value === opt ? 'selected' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
