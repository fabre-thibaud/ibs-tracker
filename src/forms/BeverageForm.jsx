import { useState } from 'react'
import { useData } from '../context/DataContext.jsx'
import { getCurrentTime } from '../utils/dates.js'
import EntryModal from '../components/EntryModal.jsx'
import TimeField from '../components/fields/TimeField.jsx'
import OptionButtons from '../components/fields/OptionButtons.jsx'
import FoodInput from '../components/fields/FoodInput.jsx'
import Toggle from '../components/fields/Toggle.jsx'

const VOLUMES = ['Small', 'Medium', 'Large']
const TEMPERATURES = ['Hot', 'Cold', 'Room temp']

export default function BeverageForm({ date, entry, onClose }) {
  const { addEntry, updateEntry, deleteEntry } = useData()
  const isEdit = !!entry

  const [time, setTime] = useState(entry?.time || getCurrentTime())
  const [items, setItems] = useState(entry?.items || [])
  const [volume, setVolume] = useState(entry?.volume || '')
  const [temperature, setTemperature] = useState(entry?.temperature || '')
  const [caffeine, setCaffeine] = useState(entry?.caffeine ?? false)
  const [alcohol, setAlcohol] = useState(entry?.alcohol ?? false)
  const [carbonated, setCarbonated] = useState(entry?.carbonated ?? false)

  function handleSave() {
    const data = {
      id: entry?.id || `d_${Date.now()}`,
      time,
      items,
      content: items.map(item => item.name).join(', ') || '',
      volume,
      temperature,
      caffeine,
      alcohol,
      carbonated,
    }
    if (isEdit) {
      updateEntry(date, 'beverages', entry.id, data)
    } else {
      addEntry(date, 'beverages', data)
    }
    onClose()
  }

  function handleDelete() {
    if (window.confirm('Delete this beverage entry?')) {
      deleteEntry(date, 'beverages', entry.id)
      onClose()
    }
  }

  return (
    <EntryModal
      title={isEdit ? 'Edit Beverage' : 'Log Beverage'}
      type="beverage"
      onSave={handleSave}
      onDelete={isEdit ? handleDelete : null}
      onClose={onClose}
    >
      <TimeField label="Time" value={time} onChange={setTime} />
      <FoodInput label="Beverages" value={items} onChange={setItems} />
      <OptionButtons
        label="Volume"
        options={VOLUMES}
        value={volume}
        onChange={setVolume}
      />
      <OptionButtons
        label="Temperature"
        options={TEMPERATURES}
        value={temperature}
        onChange={setTemperature}
      />
      <Toggle label="Caffeine" value={caffeine} onChange={setCaffeine} />
      <Toggle label="Alcohol" value={alcohol} onChange={setAlcohol} />
      <Toggle label="Carbonated" value={carbonated} onChange={setCarbonated} />
    </EntryModal>
  )
}
