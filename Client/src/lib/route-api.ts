import { ORS_API_URL, BUFFER_DEG } from '../config/constants';
import { fallbackRoutes } from '../data/fallback-routes';
import type { Hazard } from '../types/hazard';

export interface RouteFeature {
  type: 'Feature';
  properties: { summary: { distance: number; duration: number } };
  geometry: { type: 'LineString'; coordinates: [number, number][] };
}

function buildAvoidPolygons(hazards: Hazard[]) {
  const dangerous = hazards.filter((h) => h.severity === 'medium' || h.severity === 'high');
  if (dangerous.length === 0) return null;
  return {
    type: 'MultiPolygon',
    coordinates: dangerous.map((h) => [[
      [h.lng - BUFFER_DEG,             h.lat - BUFFER_DEG],
      [h.lng + h.width + BUFFER_DEG,   h.lat - BUFFER_DEG],
      [h.lng + h.width + BUFFER_DEG,   h.lat + h.height + BUFFER_DEG],
      [h.lng - BUFFER_DEG,             h.lat + h.height + BUFFER_DEG],
      [h.lng - BUFFER_DEG,             h.lat - BUFFER_DEG],
    ]]),
  };
}

async function orsRequest(
  key: string,
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  extra?: Record<string, unknown>
): Promise<RouteFeature[]> {
  const body: Record<string, unknown> = {
    coordinates: [[start.lng, start.lat], [end.lng, end.lat]],
    ...extra,
  };

  const res = await fetch(ORS_API_URL, {
    method: 'POST',
    headers: { Authorization: key, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`ORS ${res.status}`);
  const json = await res.json();
  return (json.features as RouteFeature[] | undefined) ?? [];
}

export async function fetchRoutes(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  hazards: Hazard[] = []
): Promise<RouteFeature[]> {
  const key = import.meta.env.VITE_ORS_API_KEY;
  if (!key || key.includes('your_')) {
    return fallbackRoutes.routes;
  }

  try {
    const avoidPolygons = buildAvoidPolygons(hazards);

    if (avoidPolygons) {
      const [safeResult, directResult] = await Promise.allSettled([
        orsRequest(key, start, end, { options: { avoid_polygons: avoidPolygons } }),
        orsRequest(key, start, end),
      ]);

      const safeRoute = safeResult.status === 'fulfilled' ? safeResult.value[0] : null;
      const directRoute = directResult.status === 'fulfilled' ? directResult.value[0] : null;

      const results: RouteFeature[] = [];
      if (safeRoute) results.push(safeRoute);
      if (directRoute) {
        const isDifferent =
          !safeRoute ||
          Math.abs(directRoute.properties.summary.distance - safeRoute.properties.summary.distance) > 30;
        if (isDifferent) results.push(directRoute);
      }
      if (results.length > 0) return results;
    } else {
      const features = await orsRequest(key, start, end, {
        alternative_routes: { target_count: 2, weight_factor: 1.6, share_factor: 0.6 },
      });
      if (features.length > 0) return features;
    }

    return fallbackRoutes.routes;
  } catch (err) {
    console.error('ORS fetch failed, using fallback:', err);
    return fallbackRoutes.routes;
  }
}
