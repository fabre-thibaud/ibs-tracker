import { useState } from 'react'
import { useData } from '../context/DataContext.jsx'
import EntryModal from '../components/EntryModal.jsx'
import ScaleSelector from '../components/fields/ScaleSelector.jsx'
import TextArea from '../components/fields/TextArea.jsx'

export default function SummaryForm({ date, entry, onClose }) {
  const { setSummary } = useData()
  const isEdit = !!entry

  const [feeling, setFeeling] = useState(entry?.feeling || null)
  const [energy, setEnergy] = useState(entry?.energy || null)
  const [sleep, setSleep] = useState(entry?.sleep || null)
  const [stress, setStress] = useState(entry?.stress || null)
  const [notes, setNotes] = useState(entry?.notes || '')

  function handleSave() {
    setSummary(date, { feeling, energy, sleep, stress, notes })
    onClose()
  }

  function handleDelete() {
    if (window.confirm('Delete the daily summary?')) {
      setSummary(date, null)
      onClose()
    }
  }

  return (
    <EntryModal
      title={isEdit ? 'Edit Daily Summary' : 'Daily Summary'}
      type="summary"
      onSave={handleSave}
      onDelete={isEdit ? handleDelete : null}
      onClose={onClose}
    >
      <ScaleSelector label="Overall Feeling (1-10)" value={feeling} onChange={setFeeling} />
      <ScaleSelector label="Energy Level (1-10)" value={energy} onChange={setEnergy} />
      <ScaleSelector label="Sleep Quality (1-10, optional)" value={sleep} onChange={setSleep} />
      <ScaleSelector label="Stress Level (1-10, optional)" value={stress} onChange={setStress} />
      <TextArea label="Notes" value={notes} onChange={setNotes} placeholder="How was your day?" />
    </EntryModal>
  )
}
