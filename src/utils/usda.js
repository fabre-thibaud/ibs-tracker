const BASE_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search'
const LOCAL_CACHE_KEY = 'ibs-tracker-food-cache'

/**
 * Get USDA API key from localStorage
 * @returns {string|null} - API key or null if not set
 */
function getApiKey() {
  try {
    const settings = localStorage.getItem('ibs-tracker-settings')
    if (!settings) return null
    const parsed = JSON.parse(settings)
    return parsed.usdaApiKey || null
  } catch {
    return null
  }
}

// --- Local food cache (localStorage, persisted across sessions) ---

function getLocalCache() {
  try {
    const raw = localStorage.getItem(LOCAL_CACHE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Save a food name to the local cache (deduped by lowercase name)
 */
export function cacheFood(name) {
  if (!name || !name.trim()) return
  const foods = getLocalCache()
  const normalized = name.trim().toLowerCase()
  if (foods.some((f) => f.name.toLowerCase() === normalized)) return
  foods.push({ name: name.trim() })
  localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(foods))
}

/**
 * Search the local food cache by substring match
 * @param {string} query - Search query (min 2 characters)
 * @returns {Array<{name: string}>} - Matching foods from local cache
 */
export function searchLocalFoods(query) {
  if (!query || query.length < 2) return []
  const normalized = query.toLowerCase().trim()
  return getLocalCache()
    .filter((f) => f.name.toLowerCase().includes(normalized))
    .slice(0, 8)
}

// --- USDA API search (remote, debounced) ---

// In-memory cache for API results (5 min TTL)
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000

// Debounce timer
let debounceTimer = null

/**
 * Search foods via USDA FoodData Central API
 * @param {string} query - Search query (min 2 characters)
 * @param {number} debounceMs - Debounce delay in milliseconds
 * @returns {Promise<Array<{name: string}>>} - List of food names
 */
export async function searchFoods(query, debounceMs = 350) {
  if (!query || query.length < 2) return []

  const apiKey = getApiKey()
  if (!apiKey) return []

  // Return in-memory cached result if available
  const cacheKey = query.toLowerCase().trim()
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.results
  }

  // Debounce: return a promise that resolves after debounce delay
  return new Promise((resolve, reject) => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(async () => {
      try {
        const url = new URL(BASE_URL)
        url.searchParams.set('api_key', apiKey)
        url.searchParams.set('query', query)
        url.searchParams.set('dataType', 'Foundation,SR Legacy')
        url.searchParams.set('pageSize', '8')

        const response = await fetch(url.toString())

        if (!response.ok) {
          console.error('USDA API error:', response.status, response.statusText)
          resolve([])
          return
        }

        const data = await response.json()
        const results = (data.foods || []).map((food) => ({
          name: food.description || food.lowercaseDescription || 'Unknown food',
          fdcId: food.fdcId,
        }))

        // In-memory cache
        cache.set(cacheKey, { results, timestamp: Date.now() })
        if (cache.size > 50) {
          const firstKey = cache.keys().next().value
          cache.delete(firstKey)
        }

        resolve(results)
      } catch (error) {
        console.error('USDA API fetch error:', error)
        resolve([])
      }
    }, debounceMs)
  })
}
