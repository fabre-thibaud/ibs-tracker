const BASE_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search'

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

// Cache search results for 5 minutes
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
  if (!apiKey) {
    // No API key configured - return empty results
    return []
  }

  // Return cached result if available
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

        // Cache results
        cache.set(cacheKey, { results, timestamp: Date.now() })

        // Limit cache size to 50 entries
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
