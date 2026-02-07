import { useState } from 'react'
import { useData } from '../context/DataContext.jsx'
import { getCurrentTime } from '../utils/dates.js'
import EntryModal from '../components/EntryModal.jsx'
import TimeField from '../components/fields/TimeField.jsx'
import OptionButtons from '../components/fields/OptionButtons.jsx'
import FoodInput from '../components/fields/FoodInput.jsx'
import Toggle from '../components/fields/Toggle.jsx'

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack']
const PORTIONS = ['Small', 'Medium', 'Large']

export default function MealForm({ date, entry, onClose }) {
  const { addEntry, updateEntry, deleteEntry } = useData()
  const isEdit = !!entry

  const [time, setTime] = useState(entry?.time || getCurrentTime())
  const [mealType, setMealType] = useState(entry?.type || '')
  const [items, setItems] = useState(entry?.items || [])
  const [portion, setPortion] = useState(entry?.portion || '')
  const [highFat, setHighFat] = useState(entry?.highFat ?? false)

  function handleSave() {
    const data = {
      id: entry?.id || `m_${Date.now()}`,
      time,
      type: mealType,
      content: items.map((item) => item.name).join(', ') || '',
      items,
      portion,
      highFat,
    }
    if (isEdit) {
      updateEntry(date, 'meals', entry.id, data)
    } else {
      addEntry(date, 'meals', data)
    }
    onClose()
  }

  function handleDelete() {
    if (window.confirm('Delete this meal entry?')) {
      deleteEntry(date, 'meals', entry.id)
      onClose()
    }
  }

  return (
    <EntryModal
      title={isEdit ? 'Edit Meal' : 'Log Meal'}
      type="meal"
      onSave={handleSave}
      onDelete={isEdit ? handleDelete : null}
      onClose={onClose}
    >
      <TimeField label="Time" value={time} onChange={setTime} />
      <OptionButtons label="Meal Type" options={MEAL_TYPES} value={mealType} onChange={setMealType} />
      <FoodInput label="Food & Ingredients" value={items} onChange={setItems} />
      <OptionButtons label="Portion Size" options={PORTIONS} value={portion} onChange={setPortion} />
      <Toggle label="High-Fat Meal" value={highFat} onChange={setHighFat} />
    </EntryModal>
  )
}
