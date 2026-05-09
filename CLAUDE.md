# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

AccessUB (Хүртээмжтэй UB) — an accessibility mapping web app for Ulaanbaatar, Mongolia. Users report and view hazards (ice, broken sidewalks, blocked paths, slopes) on an interactive map, plan accessible routes, and get weather-aware risk assessments. Volunteers can register to provide real-time walking/driving assistance to users in need.

## Commands

```bash
npm run dev       # Vite dev server on http://localhost:5173 (HMR enabled)
npm run build     # TypeScript check (tsc -b) + Vite production build → dist/
npm run lint      # ESLint (flat config, TypeScript + React hooks rules)
npm run preview   # Serve production build locally
```

No test framework is configured.

## Tech Stack

- **React 19** + **TypeScript 6** + **Vite 8** (ES2023 target, `react-jsx` transform)
- **MapLibre GL v5** — vector tile map rendering with OpenFreeMap tiles, no API key required
- **Supabase** — PostgreSQL database, realtime subscriptions, photo storage (`hazard-photos` bucket)
- **OpenRouteService** — pedestrian routing/directions
- **OpenWeatherMap** — weather conditions for ice risk scoring

## Architecture

**State management:** Two React Contexts — `ProfileContext` (regular user auth/profile) and `VolunteerContext` (volunteer session). Both persist to localStorage independently. No external state library.

**localStorage keys:**
- `accessub-user` / `accessub-profile` — regular user identity and accessibility profile (two keys, updated independently)
- `accessub-volunteer` — volunteer session (id, name, has_car, can_transport); presence of this key skips the splash/survey flow entirely

**App entry flow (`AppShell.tsx`):**
1. If `accessub-volunteer` is in localStorage → skip splash, skip guest login, skip survey → go directly to `HazardMap`
2. Otherwise → Splash → guest login → profile survey → map
- Volunteer presence is checked before any other routing logic. All hooks must be declared before conditional returns to satisfy Rules of Hooks.

**Context nesting order in `App.tsx`:** `VolunteerProvider` wraps `ProfileProvider` — volunteers bypass the entire profile flow, so their context must be available at the top level.

**Data flow for hazards:** `useHazards` hook fetches from Supabase with realtime subscription → starts empty if Supabase unavailable → hazard scoring in `src/lib/hazard-scoring.ts` combines weather + hazard data.

**Key directories:**
- `src/components/` — organized by feature domain (auth, hazard, map, route, question, splash, volunteer, ui)
- `src/hooks/` — data-fetching and realtime hooks
- `src/lib/` — API clients and business logic (route-api, weather-api, hazard-scoring, supabase-storage, user-api, haversine)
- `src/types/` — shared TypeScript interfaces (hazard, profile, route, volunteer)
- `src/config/` — app constants (`constants.ts`), Supabase client init (`supabase.ts`), MapLibre style (`map-style.ts`)
- `src/contexts/` — React context providers (`ProfileContext`, `VolunteerContext`)
- `src/data/` — `fallback-routes.ts` (pre-computed demo routes), `demo-locations.ts` (8 UB landmarks)

**API integration pattern:** Each external API has a corresponding file in `src/lib/` and a hook in `src/hooks/`. Config values (API URLs, map coordinates, thresholds) live in `src/config/constants.ts`.

## Map (MapLibre GL)

`HazardMap.tsx` is a single imperative component — no declarative map wrapper. Key patterns:

- **Coordinate order:** MapLibre GL uses `[lng, lat]`. `MAP_CENTER` in `constants.ts` is `[106.9177, 47.9184]`. Leaflet used `[lat, lng]` — don't mix them up.
- **Stable refs pattern:** `hazardsRef`, `setSelectedHazardRef`, `setMapCenterRef` are kept current via `useEffect` so event handlers registered in `map.on('load', ...)` never capture stale closures.
- **GeoJSON sources:** Hazards render as Polygon FeatureCollections; routes as LineString FeatureCollections. Both updated imperatively via `source.setData()` in sync `useEffect`s.
- **Map style:** Defined in `src/config/map-style.ts` — custom `StyleSpecification` using OpenFreeMap planet tiles. Off-white base (`#F5F3EE`), footways/pedestrian paths prominent, motor roads faint, no POIs.
- **`moveend` not `move`:** Map pan events use `moveend` to avoid React state updates at 60fps.
- **z-index stacking:** `.volunteer-map-btn` is z-index 500. Any overlay/modal that must appear above it must use z-index ≥ 600.

## Volunteer System

### Database tables (Supabase)

```sql
volunteers (id, name, register_id, has_car, can_transport, is_online, lat, lng, last_seen, created_at)
help_requests (id, requester_lat, requester_lng, volunteer_id, status, created_at)
-- status values: 'pending' | 'accepted' | 'declined' | 'completed'
```

Both tables need permissive RLS policies and must be added to `supabase_realtime` publication.

### Registration flow

`VolunteerRegistration.tsx` is a 4-step wizard rendered as a full-screen overlay on the splash screen:
- Step 1: name + register_id inputs
- Step 2: read-only confirmation
- Step 3: has_car → if yes, can_transport; if no, skips transport question (auto-sets `can_transport=false`)
- Step 4: thank-you screen — `registerVolunteer()` is called via `useEffect` on step change, then `onDone` fires after 2s. Registration failure is silent (no error shown to user).

`VolunteerContext.registerVolunteer()` inserts into Supabase `volunteers` table and persists to localStorage. If Supabase is unavailable, falls back to `crypto.randomUUID()` for offline id — no error shown.

### Location tracking (`useVolunteerSession.ts`)

- On mount: sets `is_online=true`
- Every `VOLUNTEER_UPDATE_INTERVAL_MS` (4000ms): pushes `{lat, lng, last_seen}` to Supabase
- Uses a ref (`locationRef`) to avoid stale closures in the interval callback — location state updates the ref via a separate `useEffect`
- On `beforeunload`: sets `is_online=false`
- On `visibilitychange` hidden: sets `is_online=false` after 30s debounce

### Volunteer list (`useVolunteers.ts`)

- Fetches `is_online=true` volunteers from Supabase
- Filters out stale entries where `last_seen` > 2 minutes old (client-side check)
- Computes haversine distance from user location; filters to `VOLUNTEER_NEARBY_KM` (10km) radius if user location is known
- If user location is null, returns all online non-stale volunteers

### Help request realtime (`useHelpRequest.ts`)

Two exported hooks with separate Supabase channels:

**`useIncomingRequest(volunteerId)`** — volunteer side:
- Subscribes to `help_requests` INSERT where `volunteer_id=eq.{id}` and `status='pending'`
- `respondToRequest(accepted)`: updates status to `'accepted'` or `'declined'`; uses `try/finally` so `setIncomingRequest(null)` always clears state on decline
- `completeRequest()`: updates status to `'completed'`; uses `try/finally` so state always clears

**`useRequestTracking(requestId)`** — requester side:
- Subscribes to `help_requests` UPDATE for the specific request id
- When `volunteer_id` becomes known, subscribes to a second channel on `volunteers` UPDATE to track live lat/lng

### Volunteer UI components

- `HelpRequestModal.tsx` — shown to volunteer when `incomingRequest` is non-null. All volunteers see YES/NO regardless of `has_car`; text adapts: `hasCar ? 'Одоо машинаараа явж чадах уу?' : 'Одоо Очиж чадах уу?'`. YES shows requester location on MiniMap + Дууслаа button. Use `key={incomingRequest.id}` when mounting to guarantee fresh `accepted` state per request.
- `VolunteerTrackingPanel.tsx` — shown to requester when `requestStatus === 'accepted'`; shows haversine distance + MiniMap with both pins live-updating
- `MiniMap.tsx` — reusable non-interactive MapLibre map; accepts a `pins` array `{lat, lng, color}`; updates markers when props change

### Visibility rules

Volunteers do **not** see:
- "Тусламж дуудах" button (`HazardMap.tsx` — guarded by `!volunteer`)
- "Аюултай юу? Сайн дурын ажилтан дуудах" button (`RoutePanel.tsx` — uses `useVolunteer()` internally)

## Offline-First / Graceful Degradation

The app is fully functional without any external services:

- **Supabase client** (`src/config/supabase.ts`) returns `null` if env vars are missing or contain placeholder values like `'your_'`. All callers must null-check it.
- **Routes**: When ORS API key is missing/invalid, `src/lib/route-api.ts` falls back to `src/data/fallback-routes.ts` with pre-computed demo routes.
- **Weather**: `src/lib/weather-api.ts` caches responses in localStorage with a 10-minute TTL and returns a -18°C default (= high ice risk) on failure.
- **Hazards**: Start as an empty array when Supabase is unavailable. Users can still add hazards locally via `addHazard` (stored in component state only).
- **Volunteer registration**: Falls back to a local UUID if Supabase is unavailable; session is still stored in localStorage and the volunteer can use the app.

## Hazard Data Model & Scoring

Hazards are **rectangles**, not points — each has `lat`, `lng`, `width`, `height` (in degrees) to cover a street section. The `source` field distinguishes `'seed'` vs `'user'` reports.

`src/lib/hazard-scoring.ts` `scoreRoute` function:
- Checks every 3rd route coordinate (performance) against each hazard's bounding box expanded by `BUFFER_DEG` (0.0002°)
- Severity is weighted non-linearly: low=1, medium=3, high=5
- Ice risk from weather integrates via `ICE_RISK_THRESHOLDS`: ≤-15°C = high, ≤-5°C = medium

## Supabase Storage (Photos)

`src/lib/supabase-storage.ts` uploads to the `hazard-photos` bucket and returns a public URL stored on the hazard record. The bucket must be set to **public** in Supabase dashboard and requires INSERT + SELECT policies on `storage.objects` for `bucket_id = 'hazard-photos'`.

## Realtime Subscription Caveats

- `useHazards` subscribes to INSERT events only. UPDATE and DELETE events on hazards require a page reload to reflect.
- `useIncomingRequest` subscribes to INSERT events on `help_requests`. `useRequestTracking` subscribes to UPDATE events on both `help_requests` and `volunteers`.
- Each channel is torn down on hook unmount via `db.removeChannel(channel)`.

## Environment Variables

All prefixed with `VITE_` (Vite convention for client-side exposure):
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — Supabase connection
- `VITE_ORS_API_KEY` — OpenRouteService routing
- `VITE_OWM_API_KEY` — OpenWeatherMap weather data
