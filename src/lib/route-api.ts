import { ORS_API_URL } from '../config/constants';
import { fallbackRoutes } from '../data/fallback-routes';

export interface RouteFeature {
  type: 'Feature';
  properties: { summary: { distance: number; duration: number } };
  geometry: { type: 'LineString'; coordinates: [number, number][] };
}

export async function fetchRoutes(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number }
): Promise<RouteFeature[]> {
  const key = import.meta.env.VITE_ORS_API_KEY;
  if (!key || key.includes('your_')) {
    return fallbackRoutes.routes;
  }

  try {
    const res = await fetch(ORS_API_URL, {
      method: 'POST',
      headers: {
        Authorization: key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coordinates: [
          [start.lng, start.lat],
          [end.lng, end.lat],
        ],
        alternative_routes: {
          target_count: 2,
          weight_factor: 1.6,
          share_factor: 0.6,
        },
      }),
    });

    if (!res.ok) throw new Error(`ORS ${res.status}`);

    const json = await res.json();
    const features = json.features as RouteFeature[] | undefined;

    if (!features || features.length === 0) {
      return fallbackRoutes.routes;
    }

    return features;
  } catch (err) {
    console.error('ORS fetch failed, using fallback:', err);
    return fallbackRoutes.routes;
  }
}
