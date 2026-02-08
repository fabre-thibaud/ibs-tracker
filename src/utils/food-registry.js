const REGISTRY_KEY = 'ibs-tracker-food-registry'

function getEmptyRegistry() {
  return { _nextId: 1 }
}

export function loadRegistry() {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY)
    return raw ? JSON.parse(raw) : getEmptyRegistry()
  } catch {
    return getEmptyRegistry()
  }
}

export function saveRegistry(registry) {
  try {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry))
  } catch (error) {
    console.error('Failed to save food registry:', error)
  }
}

/**
 * Find or create a food entry in the registry.
 * Looks up by name (case-insensitive). If found, returns existing entry
 * (updating externalId/details if provided and previously null).
 * If not found, creates a new entry.
 *
 * @param {{ name: string, fodmap?: string, externalId?: string, details?: object }} food
 * @returns {{ id: string, name: string, fodmap: string, externalId: string|null, details: object|null }}
 */
export function registerFood({ name, fodmap, externalId, details }) {
  if (!name || !name.trim()) return null

  const registry = loadRegistry()
  const trimmed = name.trim()
  const normalized = trimmed.toLowerCase()

  // Look for existing entry by name
  for (const key of Object.keys(registry)) {
    if (key.startsWith('_')) continue
    const entry = registry[key]
    if (entry.name.toLowerCase() === normalized) {
      // Update externalId and details if they were previously missing
      let updated = false
      if (externalId && !entry.externalId) {
        entry.externalId = externalId
        updated = true
      }
      if (details && !entry.details) {
        entry.details = details
        updated = true
      }
      if (updated) saveRegistry(registry)
      return entry
    }
  }

  // Create new entry
  const id = `f_${registry._nextId}`
  const entry = {
    id,
    name: trimmed,
    fodmap: fodmap || 'unknown',
    externalId: externalId || null,
    details: details || null,
  }
  registry[id] = entry
  registry._nextId++
  saveRegistry(registry)
  return entry
}

/**
 * Look up a food by its registry ID.
 * @param {string} id
 * @returns {{ id, name, fodmap, externalId, details }|null}
 */
export function findById(id) {
  if (!id) return null
  const registry = loadRegistry()
  return registry[id] || null
}

/**
 * Look up a food by name (case-insensitive).
 * @param {string} name
 * @returns {{ id, name, fodmap, externalId, details }|null}
 */
export function findByName(name) {
  if (!name) return null
  const registry = loadRegistry()
  const normalized = name.trim().toLowerCase()

  for (const key of Object.keys(registry)) {
    if (key.startsWith('_')) continue
    if (registry[key].name.toLowerCase() === normalized) {
      return registry[key]
    }
  }
  return null
}

/**
 * Search the registry by substring match on food names.
 * @param {string} query - min 2 characters
 * @returns {Array<{ id, name, fodmap, externalId, details }>}
 */
export function searchRegistry(query) {
  if (!query || query.length < 2) return []
  const registry = loadRegistry()
  const normalized = query.toLowerCase().trim()

  const results = []
  for (const key of Object.keys(registry)) {
    if (key.startsWith('_')) continue
    if (registry[key].name.toLowerCase().includes(normalized)) {
      results.push(registry[key])
      if (results.length >= 8) break
    }
  }
  return results
}
