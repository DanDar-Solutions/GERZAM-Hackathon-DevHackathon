import type { Hazard, HazardCategory, Severity } from '../types/hazard';
import type { RouteScore } from '../types/route';
import { BUFFER_DEG } from '../config/constants';
import { isPointInHazardBounds } from './hazard-geo';

const SEVERITY_WEIGHTS: Record<Severity, number> = { low: 1, medium: 3, high: 5 };

export function scoreRoute(
  routeCoords: [number, number][],
  hazards: Hazard[]
): RouteScore {
  const hits = new Map<string, Hazard>();
  const hazardsByCategory: Record<HazardCategory, number> = {
    ice: 0, broken: 0, blocked: 0, slope: 0,
  };

  for (const [lng, lat] of routeCoords) {
    for (const h of hazards) {
      if (hits.has(h.id)) continue;
      if (isPointInHazardBounds(lat, lng, h, BUFFER_DEG)) {
        hits.set(h.id, h);
        hazardsByCategory[h.category]++;
      }
    }
  }

  let weightedScore = 0;
  for (const h of hits.values()) {
    weightedScore += SEVERITY_WEIGHTS[h.severity];
  }

  return { totalHazards: hits.size, weightedScore, hazardsByCategory };
}
