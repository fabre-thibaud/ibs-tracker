import fodmapData from '../data/fodmap.json'

// Normalize a food name for fuzzy matching
function normalize(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '') // remove punctuation
    .replace(/\s+/g, ' ') // collapse whitespace
}

// Build index on first access
let index = null
function buildIndex() {
  if (index) return index

  index = new Map()
  for (const item of fodmapData) {
    const key = normalize(item.name)
    index.set(key, item)
  }
  return index
}

/**
 * Match a food name against the FODMAP dataset
 * @param {string} foodName - The food name to match
 * @returns {{ fodmap: 'low'|'high'|null, details?: object }} - FODMAP classification
 */
export function matchFodmap(foodName) {
  if (!foodName) return { fodmap: null }

  const idx = buildIndex()
  const normalized = normalize(foodName)

  // Exact match
  const exact = idx.get(normalized)
  if (exact) return { fodmap: exact.fodmap, details: exact.details }

  // Partial match (food name contains FODMAP item or vice versa)
  for (const [key, item] of idx.entries()) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return { fodmap: item.fodmap, details: item.details }
    }
  }

  // Word-level match (check if any word in food name matches a FODMAP item)
  const words = normalized.split(' ')
  for (const word of words) {
    if (word.length < 3) continue // skip short words like "of", "in"
    const match = idx.get(word)
    if (match) return { fodmap: match.fodmap, details: match.details }
  }

  return { fodmap: null }
}

/**
 * Get all FODMAP items (useful for quick-add common foods)
 * @returns {Array<{name: string, fodmap: string}>}
 */
export function getAllFodmapItems() {
  return fodmapData.map(({ name, fodmap }) => ({ name, fodmap }))
}
