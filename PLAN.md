# IBS Tracker — Implementation Plan

## Context

Personal medical tracking PWA for IBS/chronic pancreatitis symptoms. The app logs meals, pain episodes, bowel movements, and daily wellbeing — then produces weekly summaries to share with doctors. Fully client-side, offline-capable, hosted as a static site.

---

## Tech Stack

- **React 19 + Vite** — builds to static `dist/` folder
- **Plain CSS with custom properties** — no Tailwind, no CSS-in-JS
- **localStorage** — all data persistence
- **vite-plugin-pwa** — service worker generation (Workbox precaching)
- **jsPDF** — lightweight PDF export (~90KB)
- **No router** — tab-based navigation (Day / Week / Export)

Hosting: **GitHub Pages** (free, `gh-pages` branch via `gh-pages` npm package) or **Cloudflare Pages** (connect repo, auto-deploy on push).

---

## Data Model (localStorage)

Single key `ibs-tracker-data` storing a JSON object keyed by date:

```json
{
  "2026-02-07": {
    "meals": [
      {
        "id": "m_1707300000000",
        "time": "12:30",
        "type": "Lunch",
        "content": "Chicken rice vegetables",
        "portion": "Medium",
        "highFat": false
      }
    ],
    "pain": [
      {
        "id": "p_1707300000000",
        "time": "15:00",
        "location": "Right Upper Abdomen",
        "severity": 6,
        "duration": 30,
        "character": "Cramping",
        "precededBy": "High-fat lunch",
        "helpedBy": "Lying down"
      }
    ],
    "bowel": [
      {
        "id": "b_1707300000000",
        "time": "08:00",
        "bristolType": 4,
        "color": "Normal Brown",
        "blood": false,
        "mucus": false,
        "urgency": false,
        "completeEvacuation": true
      }
    ],
    "summary": {
      "feeling": 7,
      "energy": 8,
      "sleep": 7,
      "stress": 3,
      "notes": "Good day overall"
    }
  }
}
```

Settings stored separately under key `ibs-tracker-settings`:
```json
{ "theme": "light" }
```

### Data Versioning & Migration

Since all user data lives in localStorage and persists across app updates, schema changes must be handled carefully to avoid data loss or corruption.

#### Version Tracking

A `_version` field is stored at the root of the data object:

```json
{
  "_version": 1,
  "2026-02-07": { ... }
}
```

The current schema version is defined as a constant in `storage.js`. On app load, the stored version is compared to the code version. If they differ, migrations run sequentially.

#### Migration Rules

1. **New fields are always optional and have defaults.** When reading an entry, code must tolerate missing fields gracefully (e.g. `entry.newField ?? defaultValue`). This means old data works without any migration.

2. **Fields are never renamed.** If a field name is wrong, add the new name alongside the old one and read from both (`entry.newName ?? entry.oldName`). The old field can be cleaned up in a migration, but reading must handle both.

3. **Fields are never removed from existing entries.** Unused fields are simply ignored. No migration needed — they're inert.

4. **Type changes are forbidden.** A field that was a `string` stays a `string`. If a different type is needed, add a new field.

5. **Enum values are never renamed or removed.** New values can be added freely. If an old value needs to change, map it during reads (e.g. `value === 'OldName' ? 'NewName' : value`).

#### Migration System

Migrations live in `utils/migrations.js` as an ordered array of functions:

```js
const CURRENT_VERSION = 1

const migrations = [
  // v0 → v1: initial schema, no changes needed
  // v1 → v2: (example) add "hydration" field to meals
  // (data) => {
  //   for (const [date, day] of Object.entries(data)) {
  //     if (date.startsWith('_')) continue
  //     for (const meal of day.meals || []) {
  //       meal.hydration = meal.hydration ?? null
  //     }
  //   }
  //   return data
  // },
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
```

Called once in `storage.js > loadData()` before returning data to the app.

#### Backwards Compatibility Checklist (for every change)

Before modifying the data schema, verify:

- [ ] Old data without the new field still renders correctly
- [ ] New code reading old data doesn't throw or produce NaN/undefined in UI
- [ ] Migration (if needed) handles empty days, missing arrays, and null summaries
- [ ] Export functions (`export.js`) handle both old and new field shapes
- [ ] A migration test covers: load v(N-1) data → run migrate → assert v(N) shape

---

## Project Structure

```
ibs-tracker/
├── index.html
├── vite.config.js
├── package.json
├── public/
│   ├── icons/              # PWA icons (192x192, 512x512)
│   └── favicon.svg
├── src/
│   ├── main.jsx            # React root + service worker registration
│   ├── App.jsx             # Layout: header, tab content, FAB
│   ├── App.css             # Global styles + CSS custom properties + dark mode
│   ├── context/
│   │   └── DataContext.jsx  # React Context + useReducer + localStorage sync
│   ├── components/
│   │   ├── Header.jsx       # Date display, prev/next/today buttons, settings gear
│   │   ├── Header.css
│   │   ├── TabBar.jsx       # Bottom tab bar (Day / Week / Export)
│   │   ├── TabBar.css
│   │   ├── FAB.jsx          # Floating action button + radial menu (4 entry types)
│   │   ├── FAB.css
│   │   ├── EntryModal.jsx   # Full-screen slide-up modal wrapper
│   │   ├── EntryModal.css
│   │   ├── Calendar.jsx     # Date picker popup
│   │   ├── Calendar.css
│   │   └── fields/          # Reusable form field components
│   │       ├── TimeField.jsx
│   │       ├── ScaleSelector.jsx   # 1-10 number buttons (color-coded)
│   │       ├── OptionButtons.jsx   # Single-select button group
│   │       ├── TextArea.jsx
│   │       ├── Toggle.jsx          # Yes/No toggle
│   │       └── fields.css
│   ├── forms/
│   │   ├── MealForm.jsx
│   │   ├── PainForm.jsx
│   │   ├── BowelForm.jsx
│   │   └── SummaryForm.jsx
│   ├── views/
│   │   ├── DayView.jsx      # Today's entries list, grouped by type
│   │   ├── DayView.css
│   │   ├── WeekView.jsx     # Weekly text summary + stats
│   │   ├── WeekView.css
│   │   ├── ExportView.jsx   # Export options (text/PDF/CSV, copy/download)
│   │   └── ExportView.css
│   └── utils/
│       ├── storage.js        # localStorage read/write helpers
│       ├── export.js         # Generate text/CSV/PDF export content
│       ├── patterns.js       # Pattern detection logic (nice-to-have)
│       └── dates.js          # Date formatting/navigation helpers
├── PROJECT.md
└── EXPORT_FORMAT.md
```

---

## Component Architecture

### App Layout
- **Header**: Shows current date ("Today, Feb 7" or "Thursday, Feb 6"), left/right arrows for prev/next day, "Today" pill button, calendar icon to open date picker, settings gear (dark mode toggle + clear data)
- **Tab content area**: Renders `DayView`, `WeekView`, or `ExportView` based on active tab
- **Bottom TabBar**: 3 tabs — Day / Week / Export
- **FAB**: Bottom-right floating button. Tap to expand into 4 mini-buttons (Meal, Pain, Bowel, Summary). Each opens `EntryModal` with the corresponding form.

### Entry Modal
- Full-screen slide-up overlay
- Title bar with entry type name + close button
- Scrollable form content
- "Save" button at bottom (large, sticky)
- Also used for editing existing entries (pre-populated fields)

### Day View
- Chronological timeline of all entries for selected date
- Each entry is a card showing: icon + type label, time, key details (2-3 lines)
- Tap a card to edit (re-opens modal with data pre-filled)
- Swipe left to delete (or delete button in edit modal)
- Empty state: "No entries yet. Tap + to log something."
- Daily summary card pinned at top if exists

### Week View
- Text-based summary matching EXPORT_FORMAT.md structure
- Week selector (prev/next week arrows, current week range displayed)
- Sections: Meals Logged, Pain Episodes, Bowel Movements, Daily Metrics, Observations

### Export View
- "This Week" / "Custom Range" date selector
- 3 export buttons: Copy as Text, Download PDF, Download CSV
- Preview of the text export below the buttons

---

## State Management

Single `DataContext` using `useReducer`:

```
Actions:
- ADD_ENTRY(date, type, entry)
- UPDATE_ENTRY(date, type, entryId, updatedEntry)
- DELETE_ENTRY(date, type, entryId)
- SET_SUMMARY(date, summary)
- CLEAR_ALL_DATA
- SET_SELECTED_DATE(date)
- SET_ACTIVE_TAB(tab)
```

The reducer updates state and syncs to localStorage on every dispatch (via a `useEffect`). On app load, state is initialized from localStorage.

---

## Styling System

CSS custom properties on `:root`:

```css
:root {
  /* Base */
  --bg: #ffffff;
  --bg-card: #f8f9fa;
  --text: #1a1a2e;
  --text-secondary: #6b7280;
  --border: #e5e7eb;

  /* Entry type colors */
  --meal-color: #3b82f6;      /* blue */
  --pain-color: #ef4444;      /* red */
  --bowel-color: #f59e0b;     /* amber */
  --summary-color: #8b5cf6;   /* violet */

  /* Severity scale */
  --good: #22c55e;            /* green */
  --caution: #f59e0b;         /* yellow */
  --concern: #ef4444;         /* red */

  /* Touch targets */
  --min-touch: 44px;
  --button-height: 48px;
}

[data-theme="dark"] {
  --bg: #0f172a;
  --bg-card: #1e293b;
  --text: #f1f5f9;
  --text-secondary: #94a3b8;
  --border: #334155;
}
```

---

## Implementation Order

### Phase 1 — Scaffold & Data Layer
1. `npm create vite@latest . -- --template react` + install deps
2. Set up project structure (folders, empty files)
3. Implement `DataContext` + `storage.js` + localStorage persistence
4. Basic `App.jsx` layout with header, tab bar, FAB placeholder
5. CSS variables + global styles + dark mode toggle
6. PWA manifest + vite-plugin-pwa config

### Phase 2 — Entry Forms
7. Reusable field components (`TimeField`, `ScaleSelector`, `OptionButtons`, `Toggle`, `TextArea`)
8. `EntryModal` slide-up wrapper
9. `MealForm` — first complete form
10. `PainForm`
11. `BowelForm` (with Bristol Scale visual descriptions)
12. `SummaryForm`
13. FAB with radial menu to launch each form

### Phase 3 — Day View
14. `DayView` — render entries as cards, chronologically
15. Entry cards with type-colored left border, time, key info
16. Tap-to-edit (re-open modal with pre-filled data)
17. Delete entry functionality
18. `Header` with date navigation (prev/next/today)
19. `Calendar` date picker popup

### Phase 4 — Weekly Summary & Export
20. `WeekView` — aggregate data for 7 days, render text summary
21. `ExportView` — text/CSV generation + copy/download
22. PDF export using jsPDF
23. Pattern detection (nice-to-have): scan for meal→pain correlations

### Phase 5 — Polish & Deploy
24. Service worker testing (offline mode)
25. Empty states, loading states, edge cases
26. Touch UX polish (haptic feedback considerations, scroll behavior)
27. GitHub Actions CI/CD for automated deploy to GitHub Pages
28. Verify live deployment

### Phase 6 — Enhanced Meal Content Input *(branch: `feature/meal-food-input`)*
29. Bundle FODMAP dataset (`fodmap.json`) + build `FoodInput` component
30. Integrate USDA FoodData Central API for autocomplete
31. FODMAP indicator badges on food items
32. Quick-add buttons for common/recent foods
33. Update `MealForm` to use `FoodInput`, data migration v1→v2
34. Update DayView meal cards + export functions for new `items` field

---

## Feature: Enhanced Meal Content Input

### Overview

Replace the free-text `content` textarea in MealForm with a structured food input that supports:
- One food item per line (chip/tag UI)
- Autocomplete suggestions from USDA FoodData Central API
- FODMAP compatibility indicator on each item (green/amber/red dot)
- Quick-add buttons for common foods and recently used foods
- Input can be a dish name or individual ingredients

### Data Sources

#### Food Search — Open Food Facts API
- **Endpoint v2**: `GET https://world.openfoodfacts.org/api/v2/search?{params}`
- **Endpoint v1** (for text search): `GET https://world.openfoodfacts.org/cgi/search.pl?search_terms={query}&search_simple=1&json=1&page_size=8&fields=product_name,product_name_fr`
- **Auth**: None required, but **MUST** include custom `User-Agent` header: `"ibs-tracker/1.0 (https://github.com/fabre-thibaud/ibs-tracker)"`
- **Rate limit**: **10 requests/min for search queries** (strictly enforced, IP bans possible)
- **Search restrictions**: **NO "search-as-you-type"** — API explicitly prohibits this to avoid rate limit bans
- **CORS**: Supported
- **Usage**:
  - Manual trigger only (button or Enter key after user finishes typing)
  - Show top 8 results
  - Prefer French product names (`product_name_fr`) with fallback to `product_name`
- **No API key needed**: Open Food Facts is free and open, no configuration required

#### FODMAP Data — Bundled Static Dataset
- **Source**: `oseparovic/fodmap_list` on GitHub (384 foods, JSON)
- **Schema per item**: `{ name, fodmap: "low"|"high", category, details: { oligos, fructose, polyols, lactose } }`
  - `details` values: `0` = low, `1` = moderate, `2` = high
- **Bundled at build time** as `src/data/fodmap.json` (~15KB)
- **Matching**: Fuzzy match Open Food Facts product names against FODMAP dataset by normalized name
- **Fallback**: Foods not in the dataset show a neutral grey indicator ("FODMAP unknown")

### Data Model Change (v1 → v2)

Add an `items` array field to meal entries alongside the existing `content` string:

```json
{
  "id": "m_1707300000000",
  "time": "12:30",
  "type": "Lunch",
  "content": "Chicken, rice, broccoli",
  "items": [
    { "name": "Chicken breast", "fodmap": "low" },
    { "name": "Rice", "fodmap": "low" },
    { "name": "Broccoli", "fodmap": "high" }
  ],
  "portion": "Medium",
  "highFat": false
}
```

**Backwards compatibility** (per migration rules):
- `items` is optional — old entries without it still render via `content`
- `content` is always written as a comma-joined fallback of item names
- Reading code: `entry.items ?? content.split(',')` style fallback
- Migration v1→v2: no destructive changes, just stamps the version

### Component: `FoodInput`

New component at `src/components/fields/FoodInput.jsx` + `FoodInput.css`.

#### UI Layout (top to bottom)
1. **Quick-add buttons** — row of pill buttons for common foods (configurable list) + recently used foods (derived from user's history in localStorage)
2. **Text input** — single-line input with placeholder "Add a food..." and a "Search" button (or Enter key trigger)
3. **Suggestion dropdown** — appears when user triggers search (button or Enter), shows Open Food Facts results with FODMAP dot indicator
4. **Items list** — each added food shown as a chip/tag with name, FODMAP dot, and X remove button

#### Local Food Cache

Previously selected foods are cached in `localStorage` under key `ibs-tracker-food-cache` (array of `{ name: string }` objects). This avoids unnecessary API calls for foods the user has already used.

- **Storage**: `localStorage` key `ibs-tracker-food-cache`, array of `{ name }` objects, deduped by normalized name
- **Population**: Every time user selects a food (from API, quick-add, or manual entry), it's saved to the cache
- **Search priority**: Local cache is searched first (substring match, instant). If local results are found, they are shown immediately with a "Search online..." button. If no local matches and user triggers search, Open Food Facts API is called
- **No expiry**: Cache grows over time as the user builds a personal food vocabulary
- **Rate limit protection**: Local cache prevents unnecessary API calls, respecting Open Food Facts' 10 req/min limit

#### Interaction Flow
1. User taps a quick-add button → food added to items list immediately + saved to local cache
2. User types in input → local cache is searched instantly as they type (no API call)
   - If local results found (2+ chars): shown in dropdown with "Search online..." button at bottom
   - If no local results: dropdown shows "Press Enter or click Search to find online"
3. User triggers search (Enter key or Search button):
   - Local results shown first if available
   - "Search online..." button OR automatic API call if no local matches
   - Open Food Facts API called with full input text (respects 10 req/min limit, no debounce spam)
4. Suggestion dropdown appears with up to 8 results, each showing:
   - Food name (from local cache or Open Food Facts API, preferring French names)
   - FODMAP dot: green (low), red (high), grey (unknown)
5. User taps "Search online..." → triggers Open Food Facts API call, replaces suggestions with API results
6. User taps a suggestion → added to items list, saved to local cache, input cleared
7. User adds free text (Enter without selecting) → added as-is (FODMAP matched if possible), saved to local cache
8. Each item chip shows: name + FODMAP dot + X button to remove

**Rate limit compliance**: API is only called on explicit user action (Enter/button), never on keystroke. Local cache is searched first to minimize API usage.

#### FODMAP Dot Colors
- Green (`var(--good)`) — low FODMAP
- Red (`var(--concern)`) — high FODMAP
- Grey (`var(--text-muted)`) — not in dataset / unknown

### New Files

```
src/
  data/
    fodmap.json               # Bundled FODMAP dataset (384 items)
  components/fields/
    FoodInput.jsx             # Food input component with search button
    FoodInput.css             # Styles
  utils/
    fodmap.js                 # Load dataset, fuzzy match function
    openfoodfacts.js          # Open Food Facts API with rate limit protection + local cache
```

**Changed from USDA to Open Food Facts:**
- `usda.js` → `openfoodfacts.js`
- No API key required (removed Settings UI for API key)
- Custom User-Agent header: `"ibs-tracker/1.0 (https://github.com/fabre-thibaud/ibs-tracker)"`
- Manual search trigger only (no search-as-you-type)
- French product names preferred (`product_name_fr` with fallback to `product_name`)

### Quick-Add Common Foods — Statistics-Based

Quick-add buttons are **dynamically generated from user's meal history**, showing the **top 10 most frequently used foods**.

#### Statistics Tracking
- **Storage**: `localStorage` key `ibs-tracker-food-stats`
- **Schema**: `{ [foodName: string]: count: number }` — simple frequency counter
- **Update**: Increment count every time a food is added (from API, quick-add, or manual entry)
- **No expiry**: Stats accumulate over time, building a personalized food vocabulary

#### Button Generation
1. Load food stats from localStorage
2. Sort by frequency (descending)
3. Take top 10 most used foods
4. Display as quick-add buttons
5. **Fallback**: If <10 foods in stats, use hardcoded defaults to fill remaining slots:
   ```
   Rice, Chicken, Eggs, Bread, Pasta, Potato, Banana, Oats, Salmon, Yogurt
   ```

#### Benefits
- **Personalized**: Reflects user's actual eating patterns
- **Dynamic**: Automatically adapts as diet changes
- **Fast**: Most-used foods are always one tap away
- **No manual configuration**: Builds automatically over time

### Export Compatibility

- `generateWeeklySummary`: Use `items` names if available, fall back to `content` string
- `generateCSV`: Same fallback logic — join item names with commas
- Common foods list in weekly summary: count from `items[].name` when available

### Implementation Steps (Phase 6 detail)

1. **Create branch** `feature/meal-food-input` from `main`
2. **Bundle FODMAP data**: Download `fodmap_repo.json`, save as `src/data/fodmap.json`
3. **Create `utils/fodmap.js`**: Load + index FODMAP data, export `matchFodmap(name)` function (normalize + fuzzy match)
4. **Create `utils/openfoodfacts.js`**:
   - `searchFoods(query)` with rate limit protection, local cache (`cacheFood`, `searchLocalFoods`)
   - Food statistics tracking (`incrementFoodStat`, `getTopFoods`)
   - Custom User-Agent: `"ibs-tracker/1.0 (https://github.com/fabre-thibaud/ibs-tracker)"`
   - API endpoint: `https://world.openfoodfacts.org/cgi/search.pl?search_terms={query}&search_simple=1&json=1&page_size=8&fields=product_name,product_name_fr`
   - Prefer `product_name_fr` over `product_name` for French cuisine
   - No API key needed
5. **Remove USDA Settings**: Remove "USDA API Key" menu item and modal from `Header` (no longer needed)
6. **Create `FoodInput` component**: Input + Search button + dropdown + chips + quick-add buttons
   - Search triggered manually (Enter key or button click), not on keystroke
   - Local cache searched as user types (instant, no API call)
   - API only called on explicit search action (respects 10 req/min limit)
   - Quick-add buttons: Top 10 most frequently used foods from statistics
   - Fallback to hardcoded defaults if <10 foods in stats
7. **Update `MealForm`**: Replace `<TextArea label="Food Content" ...>` with `<FoodInput ...>`. Write both `content` and `items` on save.
8. **Update `DayView` meal cards**: Show item chips with FODMAP dots instead of plain text
9. **Update `migrations.js`**: Add v1→v2 migration (no-op, just version stamp)
10. **Update `export.js`**: Handle `items` array with fallback to `content`
11. **Test backwards compatibility**: Old data without `items` renders correctly

---

## CI/CD — GitHub Actions Deploy to GitHub Pages

### Prerequisites
- Repository pushed to GitHub
- GitHub Pages enabled in repo Settings → Pages → Source: **GitHub Actions**
- `vite.config.js` must set `base` to the repo name if not using a custom domain (e.g. `base: '/ibs-tracker/'`)

### Workflow File: `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci

      - run: npm run build

      - uses: actions/configure-pages@v5

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - id: deployment
        uses: actions/deploy-pages@v4
```

### How It Works
1. On every push to `main`, the workflow triggers automatically
2. Checks out code, installs Node 22, runs `npm ci` + `npm run build`
3. Uploads the `dist/` folder as a GitHub Pages artifact
4. Deploys to `https://<username>.github.io/<repo-name>/`

### Vite Base Path
If the app is served from a subpath (e.g. `github.io/ibs-tracker/`), add to `vite.config.js`:
```js
export default defineConfig({
  base: '/ibs-tracker/',
  // ...
})
```
If using a custom domain, keep `base: '/'` (the default).

---

## Verification

1. **Dev server**: `npm run dev` — app loads, forms work, data persists on refresh
2. **Offline test**: Build (`npm run build`), serve (`npx serve dist`), toggle airplane mode in DevTools — app still works
3. **Mobile test**: Open on phone (or Chrome DevTools mobile emulation) — touch targets are large enough, forms are usable, FAB works
4. **Export test**: Log several days of data, generate weekly summary, verify it matches EXPORT_FORMAT.md structure
5. **Data persistence**: Add entries, close browser, reopen — all data intact
6. **Dark mode**: Toggle theme — all components render correctly in both modes
7. **CI/CD**: Push to `main` → GitHub Actions builds successfully → site live at GitHub Pages URL
