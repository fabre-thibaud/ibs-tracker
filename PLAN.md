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
