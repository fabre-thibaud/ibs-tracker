const DATA_KEY = 'ibs-tracker-data'
const SETTINGS_KEY = 'ibs-tracker-settings'

export function loadData() {
  try {
    const raw = localStorage.getItem(DATA_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveData(data) {
  localStorage.setItem(DATA_KEY, JSON.stringify(data))
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? JSON.parse(raw) : { theme: 'light' }
  } catch {
    return { theme: 'light' }
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function clearAllData() {
  localStorage.removeItem(DATA_KEY)
}
