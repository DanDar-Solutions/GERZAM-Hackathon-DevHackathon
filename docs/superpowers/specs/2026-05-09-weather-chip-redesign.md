# Weather Chip Redesign — Design Spec

**Date:** 2026-05-09  
**Status:** Approved

## Context

The `TopBanner` sits above the map as a full-width strip with two halves: `banner-left` (AccessUB app name + profile icon) and `banner-right` (ice risk + temperature). The goal is to remove the banner entirely and reposition the weather indicator as a frosted-glass chip floating just below the search bar, freeing up the full screen for the map.

## What Changes

### Removed
- `TopBanner` component is removed from `AppShell`'s render. Its import is also dropped.
- `TopBanner.tsx` and `TopBanner.css` are deleted.
- `.hazard-map-container` height changes from `calc(100dvh - var(--banner-height))` → `100dvh`.

### Added
- New `WeatherChip` component at `src/components/ui/WeatherChip.tsx` + `WeatherChip.css`.
- Rendered inside `HazardMap`, immediately after `<SearchBar />`.

## WeatherChip Component

**Props:** none — pulls data from `useWeather()` and `ICE_RISK_LABELS` directly.

**Structure:**
```
[risk badge]  Мөсний эрсдэл        -18°C
```

- **Risk badge** — small pill using `--color-hazard-low/medium/high` as background; text is the Mongolian label (`БАГА` / `ДУНД` / `ӨНДӨР`). Driven by a BEM modifier class on the root: `weather-chip--low`, `weather-chip--medium`, `weather-chip--high`.
- **Label** — `Мөсний эрсдэл` in muted text, `font-size: 0.72rem`.
- **Temperature** — right-aligned, bold, `font-size: 0.78rem`, uses `--color-text`.

## Positioning & Layering

```
top: 70px   (= search bar top 12px + search bar height ~46px + gap 8px)
left: 12px / right: 12px
position: absolute
z-index: 499
```

`z-index: 499` places the chip below the search bar (`z-index: 500`) and below `RouteSuggestions` (`z-index: 500`). When the suggestions dropdown is open it naturally covers the chip — correct behaviour since the chip is secondary info during active search.

## Visual Style

**Light mode:**
```css
background: rgba(255, 253, 247, 0.88);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.65);
border-radius: var(--radius-md);
padding: 7px 12px;
box-shadow: var(--shadow-md);
```

**Visual mode override (`html.visual-mode .weather-chip`):**
```css
background: rgba(26, 26, 26, 0.88);
border-color: rgba(255, 255, 255, 0.15);
```

Risk badge colors use the existing `--color-hazard-*` variables which are already overridden in `html.visual-mode` in `index.css`, so badge colours adapt automatically.

## Files Touched

| File | Change |
|------|--------|
| `src/components/layout/AppShell.tsx` | Remove `<TopBanner />` render + import |
| `src/components/layout/TopBanner.tsx` | Delete |
| `src/components/layout/TopBanner.css` | Delete |
| `src/components/map/HazardMap.css` | `.hazard-map-container` height → `100dvh` |
| `src/components/map/HazardMap.tsx` | Import + render `<WeatherChip />` after `<SearchBar />` |
| `src/components/ui/WeatherChip.tsx` | New file |
| `src/components/ui/WeatherChip.css` | New file |

No changes to `SearchBar`, `RouteSuggestions`, or any other component.

## Verification

1. Run `npm run dev` and open http://localhost:5173
2. Complete the onboarding (or clear localStorage and go through splash → survey)
3. Confirm the top banner is gone — map fills the full screen top-to-bottom
4. Confirm the frosted glass chip appears ~70px from the top, left/right aligned with the search bar
5. Confirm badge color changes with ice risk level (low=green, medium=yellow, high=red)
6. Confirm the search suggestions dropdown covers the chip when the search bar is focused
7. Toggle `html.visual-mode` class in DevTools and confirm dark-background variant renders correctly
8. Run `npm run build` — no TypeScript errors
