import { useState } from 'react'
import { useData } from '../context/DataContext.jsx'
import { getCurrentTime } from '../utils/dates.js'
import EntryModal from '../components/EntryModal.jsx'
import TimeField from '../components/fields/TimeField.jsx'
import OptionButtons from '../components/fields/OptionButtons.jsx'
import ScaleSelector from '../components/fields/ScaleSelector.jsx'
import TextArea from '../components/fields/TextArea.jsx'
import '../components/fields/fields.css'

const LOCATIONS = ['Right Upper Abdomen', 'Left Upper Abdomen', 'Central', 'Lower', 'Other']
const CHARACTERS = ['Cramping', 'Sharp', 'Dull', 'Burning', 'Other']

export default function PainForm({ date, entry, onClose }) {
  const { addEntry, updateEntry, deleteEntry } = useData()
  const isEdit = !!entry

  const [time, setTime] = useState(entry?.time || getCurrentTime())
  const [location, setLocation] = useState(entry?.location || '')
  const [severity, setSeverity] = useState(entry?.severity || null)
  const [duration, setDuration] = useState(entry?.duration || '')
  const [character, setCharacter] = useState(entry?.character || '')
  const [precededBy, setPrecededBy] = useState(entry?.precededBy || '')
  const [helpedBy, setHelpedBy] = useState(entry?.helpedBy || '')

  function handleSave() {
    const data = {
      id: entry?.id || `p_${Date.now()}`,
      time,
      location,
      severity,
      duration: duration ? Number(duration) : null,
      character,
      precededBy,
      helpedBy,
    }
    if (isEdit) {
      updateEntry(date, 'pain', entry.id, data)
    } else {
      addEntry(date, 'pain', data)
    }
    onClose()
  }

  function handleDelete() {
    if (window.confirm('Delete this pain entry?')) {
      deleteEntry(date, 'pain', entry.id)
      onClose()
    }
  }

  return (
    <EntryModal
      title={isEdit ? 'Edit Pain Episode' : 'Log Pain Episode'}
      type="pain"
      onSave={handleSave}
      onDelete={isEdit ? handleDelete : null}
      onClose={onClose}
    >
      <TimeField label="Time of Onset" value={time} onChange={setTime} />
      <OptionButtons label="Location" options={LOCATIONS} value={location} onChange={setLocation} />
      <ScaleSelector label="Severity (1-10)" value={severity} onChange={setSeverity} />
      <div className="field">
        <label className="field-label">Duration (minutes)</label>
        <input
          type="number"
          className="number-input"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="e.g. 30"
          min="1"
          inputMode="numeric"
        />
      </div>
      <OptionButtons label="Character" options={CHARACTERS} value={character} onChange={setCharacter} />
      <TextArea label="What preceded it?" value={precededBy} onChange={setPrecededBy} placeholder="Optional" />
      <TextArea label="What helped?" value={helpedBy} onChange={setHelpedBy} placeholder="Optional" />
    </EntryModal>
  )
}
