const BASE_URL = 'https://world.openfoodfacts.org/cgi/search.pl'
const STATS_KEY = 'ibs-tracker-food-stats'
const USER_AGENT =
  'ibs-tracker/1.0 (https://github.com/fabre-thibaud/ibs-tracker)'

// --- Food statistics (localStorage, frequency tracking by food ID) ---

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
 * @param {string} foodId - Food registry ID (e.g. "f_1")
 */
export function incrementFoodStat(foodId) {
  if (!foodId) return

  const stats = getFoodStats()
  stats[foodId] = (stats[foodId] || 0) + 1

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  } catch (error) {
    console.error('Failed to save food stats:', error)
  }
}

/**
 * Decrement the usage count for a food item
 * @param {string} foodId - Food registry ID (e.g. "f_1")
 */
export function decrementFoodStat(foodId) {
  if (!foodId) return

  const stats = getFoodStats()

  if (stats[foodId] && stats[foodId] > 0) {
    stats[foodId] -= 1

    if (stats[foodId] === 0) {
      delete stats[foodId]
    }

    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats))
    } catch (error) {
      console.error('Failed to save food stats:', error)
    }
  }
}

/**
 * Get the top N most frequently used food IDs
 * @param {number} count - Number of top foods to return (default 10)
 * @returns {Array<string>} - Array of food IDs, sorted by frequency
 */
export function getTopFoods(count = 10) {
  const stats = getFoodStats()
  const sorted = Object.entries(stats)
    .sort(([, a], [, b]) => b - a)
    .map(([id]) => id)
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
 * @returns {Promise<Array<{name: string, brand: string|null, externalId: string|null}>>} - List of foods with brand and optional OFF barcode
 */
export async function searchFoods(query) {
  if (!query || query.length < 2) return []

  try {
    const url = new URL(BASE_URL)
    url.searchParams.set('search_terms', query)
    url.searchParams.set('search_simple', '1')
    url.searchParams.set('json', '1')
    url.searchParams.set('page_size', '8')
    url.searchParams.set('fields', 'product_name,product_name_fr,code,brands')

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': USER_AGENT,
      },
    })

    if (!response.ok) {
      console.error(
        'Open Food Facts API error:',
        response.status,
        response.statusText
      )
      return []
    }

    const data = await response.json()
    const products = data.products || []

    // Prefer English names, fallback to French
    const results = products.map(product => ({
      name:
        product.product_name || product.product_name_fr || 'Unknown product',
      brand: product.brands || null,
      externalId: product.code || null,
    }))

    return results
  } catch (error) {
    console.error('Open Food Facts API fetch error:', error)
    return []
  }
}
