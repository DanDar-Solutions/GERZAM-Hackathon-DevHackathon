# Weather Chip Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the `TopBanner` component entirely and replace it with a frosted-glass `WeatherChip` that floats below the search bar, freeing the full screen for the map.

**Architecture:** `WeatherChip` is a new zero-prop component that reads from `useWeather()` and renders as an absolutely-positioned overlay inside `HazardMap` — a sibling of `SearchBar`, not a child. `AppShell` stops rendering `TopBanner`; `HazardMap.css` expands the map container to full viewport height.

**Tech Stack:** React 19, TypeScript, CSS custom properties (`--color-hazard-*`, `--radius-md`, `--shadow-md`, `--color-text`, `--color-text-muted`), `backdrop-filter` for frosted glass.

---

### Task 1: Remove TopBanner and fix map container height

**Files:**
- Delete: `src/components/layout/TopBanner.tsx`
- Delete: `src/components/layout/TopBanner.css`
- Modify: `src/components/layout/AppShell.tsx`
- Modify: `src/components/map/HazardMap.css`

- [ ] **Step 1: Delete TopBanner files**

Delete `src/components/layout/TopBanner.tsx` and `src/components/layout/TopBanner.css`. Both files are only used by each other — confirmed safe to delete.

- [ ] **Step 2: Remove TopBanner from AppShell**

In `src/components/layout/AppShell.tsx`, remove the import and both render sites.

Current imports block (top of file):
```tsx
import { TopBanner } from './TopBanner';
```
Remove that import line entirely.

Current regular-user return (bottom of file):
```tsx
  return (
    <div className="app-shell">
      <TopBanner />
      <HazardMap />
    </div>
  );
```
Change to:
```tsx
  return (
    <div className="app-shell">
      <HazardMap />
    </div>
  );
```

Note: the volunteer path (`if (volunteer && splashDone)`) already renders `<HazardMap />` without a banner — no change needed there.

- [ ] **Step 3: Expand map container to full viewport height**

In `src/components/map/HazardMap.css`, change line 4:

Old:
```css
  height: calc(100dvh - var(--banner-height));
```
New:
```css
  height: 100dvh;
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npm run build
```

Expected: build succeeds with no TypeScript errors (no `TopBanner` references remaining).

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/AppShell.tsx src/components/map/HazardMap.css
git rm src/components/layout/TopBanner.tsx src/components/layout/TopBanner.css
git commit -m "feat: remove TopBanner; expand map to full viewport height"
```

---

### Task 2: Create WeatherChip component

**Files:**
- Create: `src/components/ui/WeatherChip.tsx`
- Create: `src/components/ui/WeatherChip.css`

- [ ] **Step 1: Create WeatherChip.tsx**

Create `src/components/ui/WeatherChip.tsx`:

```tsx
import { useWeather } from '../../hooks/useWeather';
import { ICE_RISK_LABELS } from '../../config/constants';
import './WeatherChip.css';

export function WeatherChip() {
  const weather = useWeather();
  const riskLabel = ICE_RISK_LABELS[weather.iceRisk] ?? 'ӨНДӨР';
  return (
    <div className={`weather-chip weather-chip--${weather.iceRisk}`}>
      <span className="weather-chip__badge">{riskLabel}</span>
      <span className="weather-chip__label">Мөсний эрсдэл</span>
      <span className="weather-chip__temp">{weather.temp}°C</span>
    </div>
  );
}
```

`useWeather()` signature (from `src/hooks/useWeather.ts`):
- Returns `{ temp: number, iceRisk: 'low' | 'medium' | 'high', description: string }`
- Default (no API key / offline): `{ temp: -18, iceRisk: 'high', description: '' }`

`ICE_RISK_LABELS` (from `src/config/constants.ts`):
- `{ high: 'ӨНДӨР', medium: 'ДУНД', low: 'БАГА' }`

- [ ] **Step 2: Create WeatherChip.css**

Create `src/components/ui/WeatherChip.css`:

```css
.weather-chip {
  position: absolute;
  top: 70px;
  left: 12px;
  right: 12px;
  z-index: 499;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 253, 247, 0.88);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.65);
  border-radius: var(--radius-md);
  padding: 7px 12px;
  box-shadow: var(--shadow-md);
}

html.visual-mode .weather-chip {
  background: rgba(26, 26, 26, 0.88);
  border-color: rgba(255, 255, 255, 0.15);
}

.weather-chip__badge {
  font-size: 0.65rem;
  font-weight: 700;
  color: #fff;
  padding: 2px 7px;
  border-radius: 4px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  flex-shrink: 0;
}

.weather-chip--low .weather-chip__badge    { background: var(--color-hazard-low); }
.weather-chip--medium .weather-chip__badge { background: var(--color-hazard-medium); }
.weather-chip--high .weather-chip__badge   { background: var(--color-hazard-high); }

.weather-chip__label {
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--color-text-muted);
}

.weather-chip__temp {
  margin-left: auto;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-text);
}
```

**z-index note:** `499` places the chip below `SearchBar` and `RouteSuggestions` (both `z-index: 500`). When the suggestions dropdown opens it naturally overlaps the chip — intentional, the chip is secondary during active search.

**top: 70px** = search bar top offset (12px) + search bar height (~46px) + gap (8px ~4px). Aligns chip just below the search bar with a small breathing gap.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npm run build
```

Expected: build succeeds. The component is created but not yet rendered — no visible change yet.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/WeatherChip.tsx src/components/ui/WeatherChip.css
git commit -m "feat: add WeatherChip frosted-glass component"
```

---

### Task 3: Wire WeatherChip into HazardMap

**Files:**
- Modify: `src/components/map/HazardMap.tsx`

- [ ] **Step 1: Import WeatherChip**

In `src/components/map/HazardMap.tsx`, add the import after the existing `SearchBar` import (line 21):

```tsx
import { SearchBar } from '../ui/SearchBar';
import { WeatherChip } from '../ui/WeatherChip';
```

- [ ] **Step 2: Render WeatherChip after SearchBar**

In `HazardMap.tsx`, find the JSX return block. After the `<SearchBar ... />` element (currently lines 189–193), add `<WeatherChip />`:

```tsx
      <SearchBar
        value={searchQuery}
        onChange={updateSearch}
        onFocus={focusSearch}
      />

      <WeatherChip />

      {showSuggestions && panel !== 'routes' && (
        <RouteSuggestions query={searchQuery} onSelect={selectDestination} />
      )}
```

No other changes to `HazardMap.tsx`.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npm run build
```

Expected: clean build, no errors.

- [ ] **Step 4: Manual verification**

```bash
npm run dev
```

Open http://localhost:5173. Complete or skip onboarding (or clear `localStorage` and go through splash → survey), then:

1. Banner is gone — map fills full screen top-to-bottom
2. Frosted glass chip appears ~70px from the top, aligned with the search bar's left/right edges
3. Risk badge shows correct Mongolian label (`БАГА` / `ДУНД` / `ӨНДӨР`) with appropriate color
4. Temperature is right-aligned and bold
5. Clicking the search bar and typing shows suggestions dropdown that overlays the chip (correct)
6. In DevTools, toggle `html.visual-mode` class — chip background shifts to dark `rgba(26,26,26,0.88)`

- [ ] **Step 5: Commit**

```bash
git add src/components/map/HazardMap.tsx
git commit -m "feat: render WeatherChip below search bar in HazardMap"
```
