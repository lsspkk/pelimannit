# Pelimannimerkki – Technical Documentation

## Overview

Single-page Svelte application for viewing and randomizing folk dance songs from a Google Sheets source. Designed for mobile-first practice session planning.

## Project Structure

```
src/
├── App.svelte              # Root component, orchestrates data flow
├── app.css                 # Tailwind imports
├── main.ts                 # Entry point
└── lib/
    ├── index.ts            # Barrel exports
    ├── components/
    │   ├── Header.svelte   # App header with menu
    │   ├── TabBar.svelte   # Tab navigation
    │   ├── RandomView.svelte # Song list with controls
    │   ├── DataView.svelte # Raw data table
    │   └── Toast.svelte    # Notification component
    ├── stores/
    │   ├── dataStore.ts    # Sheet data + caching
    │   ├── favoritesStore.ts # Starred songs
    │   └── settingsStore.ts  # UI preferences
    └── services/
        ├── sheetService.ts # Google Sheets fetch
        └── randomizer.ts   # Shuffle algorithm
```

## Data Source

- **Google Sheets CSV Export**: Fetches public spreadsheet via CSV export URL
- **Sheet Config**: `SHEET_ID`, `SHEET_GID` in `sheetService.ts`
- **Data Range**: Rows 2–60, Columns B–J
- **Parser**: PapaParse for CSV parsing

## Stores

| Store | Key | Content |
|-------|-----|---------|
| `dataStore` | `pelimannit-sheet-data` | `{ data: string[][], cachedDate: string }` |
| `favoritesStore` | `pelimannit-favorites` | `string[]` (song names) |
| `settingsStore` | `pelimannit-settings` | `hardestFirst`, `favoritesFirst`, `nameSort` |

Cache-first loading: displays cached data immediately, fetches fresh data in background.

## Randomization Algorithm (`randomizer.ts`)

1. **Filter**: Removes rows where column B has < 3 characters
2. **Difficulty Grouping** (`hardestFirst`): Groups by column D value, processes lowest numbers first
3. **Favorites Split** (`favoritesFirst`): Processes starred songs before others
4. **Distance Spreading**: Greedy algorithm prevents consecutive songs of same dance type
5. **Name Sort**: Optional alphabetical override (Finnish locale)

### Dance Type Detection

Scans column C for keywords: `polska`, `valssi`, `vals`, `menuetti`, `polkka`, `marssi`, `sottiisi`, `schottis`

Normalizes `vals` → `valssi`, `schottis` → `sottiisi`

## Components

### Views

| Tab | Component | Purpose |
|-----|-----------|---------|
| Random | `RandomView` | Shuffled song list with controls |
| Data | `DataView` | Raw spreadsheet view (columns B–J) |

### Controls (RandomView)

- **Suosikit ensin**: Prioritize favorited songs
- **Vaikein ensin**: Group by difficulty (lower = harder)
- **Järjestä**: Re-shuffle with current settings
- **Name sort toggle**: Cycles none → A–Z → Z–A

### Favorites

- Toggle: Click any row
- Storage: Persisted via `favoritesStore`
- Clear: Via info modal

## Dependencies

- `svelte` – Framework
- `papaparse` – CSV parsing
- Tailwind CSS v4
