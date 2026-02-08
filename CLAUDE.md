# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal IBS/digestive health tracking PWA. Single-user, no backend, no auth. All data in localStorage. Mobile-first, offline-capable.

## Commands

```bash
# Node 22 required (.nvmrc) — system default may be older
nvm use 22

npm run dev       # Vite dev server
npm run build     # Production build → dist/
npm run preview   # Serve built dist/ locally
```

No test framework is configured. No linter is configured.

## Architecture

### State Management

Single React Context (`src/context/DataContext.jsx`) with `useReducer`. All state changes go through dispatch actions: `ADD_ENTRY`, `UPDATE_ENTRY`, `DELETE_ENTRY`, `SET_SUMMARY`, `SET_SELECTED_DATE`, `SET_ACTIVE_TAB`, `SET_THEME`, `CLEAR_ALL_DATA`. State auto-syncs to localStorage via `useEffect` on every change.

Access state and actions anywhere via the `useData()` hook.

### Data Model

- **Main data**: localStorage key `ibs-tracker-data` — JSON object keyed by date `YYYY-MM-DD`, each containing `{ meals[], pain[], bowel[], summary }`.
- **Settings**: localStorage key `ibs-tracker-settings` — `{ theme: "light" | "dark" }`.
- **Food cache**: localStorage key `ibs-tracker-food-cache` — previously searched food names for instant local autocomplete.
- **Food stats**: localStorage key `ibs-tracker-food-stats` — `{ [foodName]: count }` for frequency-based quick-add buttons.
- Entry IDs are timestamp-based with type prefix: `m_`, `p_`, `b_`.

### Data Migrations

`src/utils/migrations.js` — versioned migration system. Current version is 2. When adding schema changes, add a migration function to the `migrations` array and bump `CURRENT_VERSION`. Old data is migrated on load.

### Navigation

No router. Three tabs (Day/Week/Export) managed via `activeTab` in state. Forms open in full-screen slide-up modals (`EntryModal`). FAB with radial menu launches the 4 form types (Meal, Pain, Bowel, Summary).

### Food Search

`src/utils/openfoodfacts.js` — Open Food Facts API integration. Rate limit: 10 req/min. Search must only be triggered on explicit user action (button click or Enter key), never on keystroke. French product names are preferred (`product_name_fr` → `product_name` fallback). Local cache provides instant search-as-you-type; API search is manual only.

### Styling

Plain CSS with custom properties defined in `src/App.css`. No CSS framework. Dark mode via `[data-theme="dark"]` on `<html>`. Design tokens cover entry type colors (meal=blue, pain=red, bowel=amber, summary=violet), severity scale (good=green, caution=yellow, concern=red), and touch targets (`--min-touch: 44px`). Safe area insets handled for PWA.

### PWA

Configured in `vite.config.js` via `vite-plugin-pwa`. Base path is `/ibs-tracker/` (GitHub Pages). Workbox precaches JS/CSS/HTML/SVG/PNG. Service worker auto-updates.

## Key Conventions

- Reusable form fields in `src/components/fields/` (TimeField, ScaleSelector, OptionButtons, Toggle, TextArea, FoodInput).
- Each form type (Meal, Pain, Bowel, Summary) is in `src/forms/`.
- Views (DayView, WeekView, ExportView) are in `src/views/`.
- Date utilities in `src/utils/dates.js` — dates are always stored as `YYYY-MM-DD` strings via `toDateKey()`.
- FODMAP data is a static JSON dataset at `src/data/fodmap.json` matched via `src/utils/fodmap.js`.
- Export format spec is in `EXPORT_FORMAT.md`.
