import { useState } from 'react'
import { useData } from '../context/DataContext.jsx'
import { getCurrentTime } from '../utils/dates.js'
import EntryModal from '../components/EntryModal.jsx'
import TimeField from '../components/fields/TimeField.jsx'
import OptionButtons from '../components/fields/OptionButtons.jsx'
import Toggle from '../components/fields/Toggle.jsx'
import '../components/fields/fields.css'

const BRISTOL_TYPES = [
  { type: 1, label: 'Type 1', desc: 'Separate hard lumps (severe constipation)' },
  { type: 2, label: 'Type 2', desc: 'Lumpy and sausage-like (mild constipation)' },
  { type: 3, label: 'Type 3', desc: 'Sausage with cracks (normal)' },
  { type: 4, label: 'Type 4', desc: 'Smooth, soft sausage (ideal)' },
  { type: 5, label: 'Type 5', desc: 'Soft blobs (lacking fiber)' },
  { type: 6, label: 'Type 6', desc: 'Mushy, fluffy pieces (mild diarrhea)' },
  { type: 7, label: 'Type 7', desc: 'Entirely liquid (severe diarrhea)' },
]

const COLORS = ['Normal Brown', 'Dark', 'Pale', 'Red', 'Black', 'Other']

export default function BowelForm({ date, entry, onClose }) {
  const { addEntry, updateEntry, deleteEntry } = useData()
  const isEdit = !!entry

  const [time, setTime] = useState(entry?.time || getCurrentTime())
  const [bristolType, setBristolType] = useState(entry?.bristolType || null)
  const [color, setColor] = useState(entry?.color || '')
  const [blood, setBlood] = useState(entry?.blood ?? false)
  const [mucus, setMucus] = useState(entry?.mucus ?? false)
  const [urgency, setUrgency] = useState(entry?.urgency ?? false)
  const [completeEvacuation, setCompleteEvacuation] = useState(entry?.completeEvacuation ?? null)

  function handleSave() {
    const data = {
      id: entry?.id || `b_${Date.now()}`,
      time,
      bristolType,
      color,
      blood,
      mucus,
      urgency,
      completeEvacuation,
    }
    if (isEdit) {
      updateEntry(date, 'bowel', entry.id, data)
    } else {
      addEntry(date, 'bowel', data)
    }
    onClose()
  }

  function handleDelete() {
    if (window.confirm('Delete this bowel movement entry?')) {
      deleteEntry(date, 'bowel', entry.id)
      onClose()
    }
  }

  return (
    <EntryModal
      title={isEdit ? 'Edit Bowel Movement' : 'Log Bowel Movement'}
      type="bowel"
      onSave={handleSave}
      onDelete={isEdit ? handleDelete : null}
      onClose={onClose}
    >
      <TimeField label="Time" value={time} onChange={setTime} />

      <div className="field">
        <label className="field-label">Bristol Stool Scale</label>
        <div className="bristol-buttons">
          {BRISTOL_TYPES.map((b) => (
            <button
              key={b.type}
              type="button"
              className={`bristol-btn ${bristolType === b.type ? 'selected' : ''}`}
              onClick={() => setBristolType(b.type)}
            >
              <span className="bristol-type-num">{b.type}</span>
              <span className="bristol-desc">
                <span className="bristol-desc-label">{b.label}</span>
                <br />
                <span className="bristol-desc-detail">{b.desc}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <OptionButtons label="Color" options={COLORS} value={color} onChange={setColor} />
      <Toggle label="Blood Present" value={blood} onChange={setBlood} />
      <Toggle label="Mucus Present" value={mucus} onChange={setMucus} />
      <Toggle label="Urgency" value={urgency} onChange={setUrgency} />
      <Toggle label="Complete Evacuation" value={completeEvacuation} onChange={setCompleteEvacuation} />
    </EntryModal>
  )
}
