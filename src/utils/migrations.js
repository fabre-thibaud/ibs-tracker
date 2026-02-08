import { matchFodmap } from './fodmap.js'

export const CURRENT_VERSION = 4

// Ordered array of migration functions: migrations[0] migrates v0 → v1, etc.
// Each function receives the full data object and returns the migrated data.
const migrations = [
  // v0 → v1: stamp initial version, no structural changes needed
  data => data,

  // v1 → v2: add `items` field to meals (optional, backwards compatible)
  // No data transformation needed — old entries without `items` will use `content` as fallback
  data => data,

  // v2 → v3: add `beverages` array to each day
  data => {
    for (const key of Object.keys(data)) {
      if (key.startsWith('_')) continue
      if (!data[key].beverages) {
        data[key].beverages = []
      }
    }
    return data
  },

  // v3 → v4: introduce food registry with ID-based references
  data => {
    const REGISTRY_KEY = 'ibs-tracker-food-registry'
    const STATS_KEY = 'ibs-tracker-food-stats'
    const CACHE_KEY = 'ibs-tracker-food-cache'

    // 1. Collect all unique food names from entries and cache
    const nameToFodmap = new Map() // name (lowercase) → { name (original), fodmap }

    for (const key of Object.keys(data)) {
      if (key.startsWith('_')) continue
      const day = data[key]

      for (const entry of day.meals || []) {
        for (const item of entry.items || []) {
          if (!item.name) continue
          const lower = item.name.trim().toLowerCase()
          if (!nameToFodmap.has(lower)) {
            nameToFodmap.set(lower, {
              name: item.name.trim(),
              fodmap: item.fodmap || 'unknown',
            })
          }
        }
      }

      for (const entry of day.beverages || []) {
        for (const item of entry.items || []) {
          if (!item.name) continue
          const lower = item.name.trim().toLowerCase()
          if (!nameToFodmap.has(lower)) {
            nameToFodmap.set(lower, {
              name: item.name.trim(),
              fodmap: item.fodmap || 'unknown',
            })
          }
        }
      }
    }

    // Also include foods from the local cache
    try {
      const cacheRaw = localStorage.getItem(CACHE_KEY)
      const cache = cacheRaw ? JSON.parse(cacheRaw) : []
      for (const entry of cache) {
        if (!entry.name) continue
        const lower = entry.name.trim().toLowerCase()
        if (!nameToFodmap.has(lower)) {
          const { fodmap } = matchFodmap(entry.name)
          nameToFodmap.set(lower, {
            name: entry.name.trim(),
            fodmap: fodmap || 'unknown',
          })
        }
      }
    } catch {
      // Ignore cache read errors
    }

    // 2. Build registry
    const registry = { _nextId: 1 }
    const nameToId = new Map() // lowercase name → food ID

    for (const [lower, info] of nameToFodmap.entries()) {
      const id = `f_${registry._nextId}`
      registry[id] = {
        id,
        name: info.name,
        fodmap: info.fodmap,
        externalId: null,
        details: null,
      }
      nameToId.set(lower, id)
      registry._nextId++
    }

    // 3. Save registry to localStorage
    try {
      localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry))
    } catch {
      // Ignore write errors
    }

    // 4. Update entry items: add foodId to each item
    for (const key of Object.keys(data)) {
      if (key.startsWith('_')) continue
      const day = data[key]

      for (const entry of day.meals || []) {
        if (!entry.items) continue
        entry.items = entry.items.map(item => {
          if (item.foodId) return item // Already migrated
          const lower = (item.name || '').trim().toLowerCase()
          const foodId = nameToId.get(lower)
          return foodId
            ? { foodId, name: item.name, fodmap: item.fodmap }
            : item
        })
      }

      for (const entry of day.beverages || []) {
        if (!entry.items) continue
        entry.items = entry.items.map(item => {
          if (item.foodId) return item
          const lower = (item.name || '').trim().toLowerCase()
          const foodId = nameToId.get(lower)
          return foodId
            ? { foodId, name: item.name, fodmap: item.fodmap }
            : item
        })
      }
    }

    // 5. Migrate food stats from name-keyed to ID-keyed
    try {
      const statsRaw = localStorage.getItem(STATS_KEY)
      const oldStats = statsRaw ? JSON.parse(statsRaw) : {}
      const newStats = {}

      for (const [name, count] of Object.entries(oldStats)) {
        const lower = name.trim().toLowerCase()
        const foodId = nameToId.get(lower)
        if (foodId) {
          newStats[foodId] = (newStats[foodId] || 0) + count
        }
      }

      localStorage.setItem(STATS_KEY, JSON.stringify(newStats))
    } catch {
      // Ignore stats migration errors
    }

    // 6. Remove old food cache (registry replaces it)
    try {
      localStorage.removeItem(CACHE_KEY)
    } catch {
      // Ignore
    }

    return data
  },
]

export function migrateData(data) {
  let version = data._version ?? 0

  while (version < CURRENT_VERSION) {
    data = migrations[version](data)
    version++
  }

  data._version = CURRENT_VERSION
  return data
}
