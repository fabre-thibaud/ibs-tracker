import { createContext, useContext, useReducer, useEffect } from 'react'
import { loadData, saveData, loadSettings, saveSettings, clearAllData } from '../utils/storage.js'
import { toDateKey } from '../utils/dates.js'

const DataContext = createContext(null)

function getEmptyDay() {
  return { meals: [], pain: [], bowel: [], summary: null }
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_ENTRY': {
      const { date, entryType, entry } = action
      const day = state.data[date] || getEmptyDay()
      return {
        ...state,
        data: {
          ...state.data,
          [date]: {
            ...day,
            [entryType]: [...day[entryType], entry],
          },
        },
      }
    }
    case 'UPDATE_ENTRY': {
      const { date, entryType, entryId, entry } = action
      const day = state.data[date]
      if (!day) return state
      return {
        ...state,
        data: {
          ...state.data,
          [date]: {
            ...day,
            [entryType]: day[entryType].map((e) => (e.id === entryId ? entry : e)),
          },
        },
      }
    }
    case 'DELETE_ENTRY': {
      const { date, entryType, entryId } = action
      const day = state.data[date]
      if (!day) return state
      return {
        ...state,
        data: {
          ...state.data,
          [date]: {
            ...day,
            [entryType]: day[entryType].filter((e) => e.id !== entryId),
          },
        },
      }
    }
    case 'SET_SUMMARY': {
      const { date, summary } = action
      const day = state.data[date] || getEmptyDay()
      return {
        ...state,
        data: {
          ...state.data,
          [date]: { ...day, summary },
        },
      }
    }
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.date }
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.tab }
    case 'SET_THEME': {
      const settings = { ...state.settings, theme: action.theme }
      return { ...state, settings }
    }
    case 'CLEAR_ALL_DATA':
      return { ...state, data: {} }
    default:
      return state
  }
}

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, () => ({
    data: loadData(),
    settings: loadSettings(),
    selectedDate: toDateKey(new Date()),
    activeTab: 'day',
  }))

  // Persist data to localStorage
  useEffect(() => {
    saveData(state.data)
  }, [state.data])

  // Persist settings and apply theme
  useEffect(() => {
    saveSettings(state.settings)
    document.documentElement.setAttribute('data-theme', state.settings.theme)
  }, [state.settings])

  const actions = {
    addEntry(date, entryType, entry) {
      dispatch({ type: 'ADD_ENTRY', date, entryType, entry })
    },
    updateEntry(date, entryType, entryId, entry) {
      dispatch({ type: 'UPDATE_ENTRY', date, entryType, entryId, entry })
    },
    deleteEntry(date, entryType, entryId) {
      dispatch({ type: 'DELETE_ENTRY', date, entryType, entryId })
    },
    setSummary(date, summary) {
      dispatch({ type: 'SET_SUMMARY', date, summary })
    },
    setSelectedDate(date) {
      dispatch({ type: 'SET_SELECTED_DATE', date })
    },
    setActiveTab(tab) {
      dispatch({ type: 'SET_ACTIVE_TAB', tab })
    },
    toggleTheme() {
      dispatch({ type: 'SET_THEME', theme: state.settings.theme === 'light' ? 'dark' : 'light' })
    },
    clearAll() {
      clearAllData()
      dispatch({ type: 'CLEAR_ALL_DATA' })
    },
    getDayData(date) {
      return state.data[date] || getEmptyDay()
    },
  }

  return (
    <DataContext.Provider value={{ state, ...actions }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used within DataProvider')
  return context
}
