import type { Hazard, HazardCategory } from '../types/hazard';
import type { RouteScore } from '../types/route';
import { BUFFER_DEG } from '../config/constants';

export function scoreRoute(
  routeCoords: [number, number][],
  hazards: Hazard[]
): RouteScore {
  const hitIds = new Set<string>();
  const hazardsByCategory: Record<HazardCategory, number> = {
    ice: 0,
    broken: 0,
    blocked: 0,
    slope: 0,
  };

  for (let i = 0; i < routeCoords.length; i += 3) {
    const [lng, lat] = routeCoords[i];

    for (const h of hazards) {
      if (hitIds.has(h.id)) continue;

      const minLat = h.lat - BUFFER_DEG;
      const maxLat = h.lat + h.height + BUFFER_DEG;
      const minLng = h.lng - BUFFER_DEG;
      const maxLng = h.lng + h.width + BUFFER_DEG;

      if (lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng) {
        hitIds.add(h.id);
        hazardsByCategory[h.category]++;
      }
    }
  }

  const weights = { low: 1, medium: 3, high: 5 };
  let weightedScore = 0;
  for (const id of hitIds) {
    const h = hazards.find((hz) => hz.id === id);
    if (h) weightedScore += weights[h.severity];
  }

  return {
    totalHazards: hitIds.size,
    weightedScore,
    hazardsByCategory,
  };
}
