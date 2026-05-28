import type { Hazard, HazardCategory } from '../types/hazard';
import { BUFFER_DEG } from '../config/constants';
import { haversineMeters } from './haversine';
import { isPointInHazardBounds } from './hazard-geo';

function bearingDeg(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const dλ = ((lng2 - lng1) * Math.PI) / 180;
  const y = Math.sin(dλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(dλ);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

export interface HazardAhead {
  hazard: Hazard;
  distM: number;
  side: 'left' | 'right' | 'ahead';
}

// routeCoords is [lng, lat][] (MapLibre / GeoJSON order)
export function findHazardsAhead(
  userLat: number,
  userLng: number,
  routeCoords: [number, number][],
  hazards: Hazard[],
  lookaheadM = 150,
): HazardAhead[] {
  if (!routeCoords.length) return [];

  // Nearest route point index
  let nearestIdx = 0;
  let nearestDist = Infinity;
  for (let i = 0; i < routeCoords.length; i++) {
    const [lng, lat] = routeCoords[i];
    const d = haversineMeters(userLat, userLng, lat, lng);
    if (d < nearestDist) { nearestDist = d; nearestIdx = i; }
  }

  // Walk forward up to lookaheadM to build the lookahead window
  const lookaheadCoords: [number, number][] = [routeCoords[nearestIdx]];
  let cumDist = 0;
  for (let i = nearestIdx; i < routeCoords.length - 1; i++) {
    const [lng1, lat1] = routeCoords[i];
    const [lng2, lat2] = routeCoords[i + 1];
    cumDist += haversineMeters(lat1, lng1, lat2, lng2);
    lookaheadCoords.push(routeCoords[i + 1]);
    if (cumDist >= lookaheadM) break;
  }

  // Route bearing at user position (for left/right calculation)
  const nextIdx = Math.min(nearestIdx + 1, routeCoords.length - 1);
  const [curLng, curLat] = routeCoords[nearestIdx];
  const [nextLng, nextLat] = routeCoords[nextIdx];
  const routeBearing = bearingDeg(curLat, curLng, nextLat, nextLng);

  const buf = BUFFER_DEG + 0.0003;
  const results: HazardAhead[] = [];
  const seen = new Set<string>();

  for (const hazard of hazards) {
    if (seen.has(hazard.id)) continue;

    const hit = lookaheadCoords.some(([lng, lat]) =>
      isPointInHazardBounds(lat, lng, hazard, buf),
    );
    if (!hit) continue;
    seen.add(hazard.id);

    const hCenterLat = hazard.lat + hazard.height / 2;
    const hCenterLng = hazard.lng + hazard.width / 2;
    const distM = haversineMeters(userLat, userLng, hCenterLat, hCenterLng);
    const hazardBearing = bearingDeg(userLat, userLng, hCenterLat, hCenterLng);
    const relAngle = ((hazardBearing - routeBearing) + 360) % 360;
    const side: 'left' | 'right' | 'ahead' =
      relAngle < 25 || relAngle > 335 ? 'ahead'
      : relAngle <= 180 ? 'right'
      : 'left';

    results.push({ hazard, distM, side });
  }

  return results.sort((a, b) => a.distM - b.distM);
}

const CATEGORY_GUIDANCE: Record<HazardCategory, string> = {
  ice: 'мөс',
  broken: 'эвдэрсэн зам',
  blocked: 'хаалттай зам',
  slope: 'налуу хэсэг',
};

const SIDE_LABEL: Record<'left' | 'right' | 'ahead', string> = {
  left: 'зүүн талд',
  right: 'баруун талд',
  ahead: 'урдаа',
};

export function formatGuidance(h: HazardAhead): string {
  const dist = Math.max(10, Math.round(h.distM / 10) * 10);
  return `${dist}м дараа ${SIDE_LABEL[h.side]} ${CATEGORY_GUIDANCE[h.hazard.category]} байна`;
}
