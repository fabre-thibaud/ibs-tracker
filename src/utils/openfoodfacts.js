const BASE_URL = 'https://world.openfoodfacts.org/cgi/search.pl'
const LOCAL_CACHE_KEY = 'ibs-tracker-food-cache'
const STATS_KEY = 'ibs-tracker-food-stats'
const USER_AGENT = 'ibs-tracker/1.0 (https://github.com/fabre-thibaud/ibs-tracker)'

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

// --- Food statistics (localStorage, frequency tracking) ---

function getFoodStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

/**
 * Increment the usage count for a food item
 * @param {string} name - Food name to track
 */
export function incrementFoodStat(name) {
  if (!name || !name.trim()) return

  const stats = getFoodStats()
  const normalized = name.trim()
  stats[normalized] = (stats[normalized] || 0) + 1

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  } catch (error) {
    console.error('Failed to save food stats:', error)
  }
}

/**
 * Get the top N most frequently used foods
 * @param {number} count - Number of top foods to return (default 10)
 * @returns {Array<string>} - Array of food names, sorted by frequency
 */
export function getTopFoods(count = 10) {
  const stats = getFoodStats()
  const sorted = Object.entries(stats)
    .sort(([, a], [, b]) => b - a) // Sort by count descending
    .map(([name]) => name)
    .slice(0, count)

  return sorted
}

// --- Open Food Facts API search (remote, rate limited) ---

/**
 * Search foods via Open Food Facts API
 * Rate limit: 10 requests/min
 * IMPORTANT: This should only be called on explicit user action (button click or Enter key),
 * never on keystroke (search-as-you-type is prohibited by the API)
 *
 * @param {string} query - Search query (min 2 characters)
 * @returns {Promise<Array<{name: string}>>} - List of food names
 */
export async function searchFoods(query) {
  if (!query || query.length < 2) return []

  try {
    const url = new URL(BASE_URL)
    url.searchParams.set('search_terms', query)
    url.searchParams.set('search_simple', '1')
    url.searchParams.set('json', '1')
    url.searchParams.set('page_size', '8')
    url.searchParams.set('fields', 'product_name,product_name_fr')

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': USER_AGENT,
      },
    })

    if (!response.ok) {
      console.error('Open Food Facts API error:', response.status, response.statusText)
      return []
    }

    const data = await response.json()
    const products = data.products || []

    // Prefer French names, fallback to English
    const results = products.map((product) => ({
      name: product.product_name_fr || product.product_name || 'Unknown product',
    }))

    return results
  } catch (error) {
    console.error('Open Food Facts API fetch error:', error)
    return []
  }
}
