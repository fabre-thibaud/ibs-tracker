export const CURRENT_VERSION = 2

// Ordered array of migration functions: migrations[0] migrates v0 → v1, etc.
// Each function receives the full data object and returns the migrated data.
const migrations = [
  // v0 → v1: stamp initial version, no structural changes needed
  (data) => data,

  // v1 → v2: add `items` field to meals (optional, backwards compatible)
  // No data transformation needed — old entries without `items` will use `content` as fallback
  (data) => data,
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
