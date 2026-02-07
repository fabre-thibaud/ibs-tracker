import { useState, useEffect, useRef } from 'react'
import { matchFodmap } from '../../utils/fodmap.js'
import { searchFoods } from '../../utils/usda.js'
import './FoodInput.css'

const COMMON_FOODS = [
  'Rice', 'Chicken', 'Eggs', 'Bread', 'Pasta', 'Potato', 'Banana', 'Oats',
  'Salmon', 'Yogurt', 'Cheese', 'Tomato', 'Spinach', 'Carrot', 'Apple',
  'Onion', 'Garlic', 'Avocado', 'Milk', 'Butter'
]

function FodmapDot({ fodmap }) {
  const className = fodmap === 'low' ? 'fodmap-dot--low'
    : fodmap === 'high' ? 'fodmap-dot--high'
    : 'fodmap-dot--unknown'

  return <span className={`fodmap-dot ${className}`} title={fodmap || 'Unknown'} />
}

export default function FoodInput({ label, value = [], onChange }) {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef(null)

  // Handle autocomplete search
  useEffect(() => {
    if (inputValue.length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    setLoading(true)
    setShowDropdown(true)

    searchFoods(inputValue).then((results) => {
      setSuggestions(results)
      setLoading(false)
    })
  }, [inputValue])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function addFood(foodName) {
    if (!foodName.trim()) return

    const { fodmap } = matchFodmap(foodName)
    const newItem = { name: foodName.trim(), fodmap: fodmap || 'unknown' }

    // Avoid duplicates
    if (value.some((item) => item.name.toLowerCase() === newItem.name.toLowerCase())) {
      return
    }

    onChange([...value, newItem])
    setInputValue('')
    setSuggestions([])
    setShowDropdown(false)
  }

  function removeFood(index) {
    onChange(value.filter((_, i) => i !== index))
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputValue.trim()) {
        addFood(inputValue)
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
      setInputValue('')
    }
  }

  return (
    <div className="field">
      <label className="field-label">{label}</label>

      {/* Quick-add buttons */}
      <div className="food-quick-add">
        {COMMON_FOODS.slice(0, 12).map((food) => (
          <button
            key={food}
            type="button"
            className="food-quick-btn"
            onClick={() => addFood(food)}
          >
            {food}
          </button>
        ))}
      </div>

      {/* Input with autocomplete */}
      <div className="food-input-container" ref={inputRef}>
        <input
          type="text"
          className="food-text-input"
          placeholder="Add a food or ingredient..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue.length >= 2 && setShowDropdown(true)}
        />

        {/* Dropdown suggestions */}
        {showDropdown && (
          <div className="food-suggestions">
            {loading && <div className="food-loading">Searching...</div>}

            {!loading && suggestions.length === 0 && inputValue.length >= 2 && (
              <div className="food-no-results">No results. Press Enter to add "{inputValue}"</div>
            )}

            {!loading && suggestions.map((food, idx) => {
              const { fodmap } = matchFodmap(food.name)
              return (
                <div
                  key={idx}
                  className="food-suggestion-item"
                  onClick={() => addFood(food.name)}
                >
                  <FodmapDot fodmap={fodmap} />
                  <span className="food-suggestion-name">{food.name}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Items list (chips) */}
      <div className="food-items">
        {value.length === 0 && (
          <div className="food-items-empty">No foods added yet</div>
        )}

        {value.map((item, idx) => (
          <div key={idx} className="food-item-chip">
            <FodmapDot fodmap={item.fodmap} />
            <span className="food-item-name">{item.name}</span>
            <button
              type="button"
              className="food-item-remove"
              onClick={() => removeFood(idx)}
              aria-label={`Remove ${item.name}`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
