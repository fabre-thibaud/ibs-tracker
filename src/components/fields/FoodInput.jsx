import { useState, useEffect, useRef } from 'react'
import { matchFodmap } from '../../utils/fodmap.js'
import { searchFoods, searchLocalFoods, cacheFood, incrementFoodStat, decrementFoodStat, getTopFoods } from '../../utils/openfoodfacts.js'
import './FoodInput.css'

const FALLBACK_FOODS = [
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
  const [isLocalResults, setIsLocalResults] = useState(false)
  const [quickAddFoods, setQuickAddFoods] = useState([])
  const inputRef = useRef(null)

  // Load top foods from statistics on mount
  useEffect(() => {
    const topFoods = getTopFoods(10)
    if (topFoods.length >= 10) {
      setQuickAddFoods(topFoods)
    } else {
      // Combine top foods with fallback to get 12 items
      const combined = [...topFoods, ...FALLBACK_FOODS].slice(0, 12)
      setQuickAddFoods(combined)
    }
  }, [])

  // Search local cache as user types (instant, no API call)
  useEffect(() => {
    if (inputValue.length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      setIsLocalResults(false)
      return
    }

    // Search local cache only (instant, no API call)
    const localResults = searchLocalFoods(inputValue)
    if (localResults.length > 0) {
      setSuggestions(localResults)
      setIsLocalResults(true)
      setShowDropdown(true)
    } else {
      // Show hint to trigger online search
      setSuggestions([])
      setIsLocalResults(false)
      setShowDropdown(false)
    }
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

    cacheFood(foodName)
    incrementFoodStat(foodName)
    onChange([...value, newItem])
    setInputValue('')
    setSuggestions([])
    setShowDropdown(false)
    setIsLocalResults(false)

    // Refresh quick-add buttons after adding a food
    const topFoods = getTopFoods(10)
    if (topFoods.length >= 10) {
      setQuickAddFoods(topFoods)
    } else {
      const combined = [...topFoods, ...FALLBACK_FOODS].slice(0, 12)
      setQuickAddFoods(combined)
    }
  }

  function removeFood(index) {
    const foodToRemove = value[index]
    if (foodToRemove) {
      decrementFoodStat(foodToRemove.name)

      // Refresh quick-add buttons after removing a food
      const topFoods = getTopFoods(10)
      if (topFoods.length >= 10) {
        setQuickAddFoods(topFoods)
      } else {
        const combined = [...topFoods, ...FALLBACK_FOODS].slice(0, 12)
        setQuickAddFoods(combined)
      }
    }

    onChange(value.filter((_, i) => i !== index))
  }

  function handleSearchOnline() {
    if (!inputValue || inputValue.length < 2) return

    setIsLocalResults(false)
    setLoading(true)
    setShowDropdown(true)

    searchFoods(inputValue).then((results) => {
      setSuggestions(results)
      setLoading(false)
    })
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()

      // If there are suggestions, use the first one
      if (suggestions.length > 0) {
        addFood(suggestions[0].name)
      } else if (inputValue.trim()) {
        // No suggestions - trigger online search or add as-is if already searched
        if (!loading && inputValue.length >= 2) {
          handleSearchOnline()
        } else {
          addFood(inputValue)
        }
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
        {quickAddFoods.map((food) => (
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

      {/* Input with search button */}
      <div className="food-input-container" ref={inputRef}>
        <div className="food-input-wrapper">
          <input
            type="text"
            className="food-text-input"
            placeholder="Add a food or ingredient..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue.length >= 2 && setShowDropdown(true)}
          />
          <button
            type="button"
            className="food-search-btn"
            onClick={handleSearchOnline}
            disabled={inputValue.length < 2}
          >
            Search
          </button>
        </div>

        {/* Dropdown suggestions */}
        {showDropdown && (
          <div className="food-suggestions">
            {loading && <div className="food-loading">Searching online...</div>}

            {!loading && suggestions.length === 0 && inputValue.length >= 2 && (
              <div className="food-no-results">No results found. Press Enter to add "{inputValue}" anyway</div>
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

            {!loading && isLocalResults && (
              <button
                type="button"
                className="food-search-online"
                onClick={handleSearchOnline}
              >
                Search online for more...
              </button>
            )}
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
