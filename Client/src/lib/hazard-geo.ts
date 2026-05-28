import type { Hazard } from '../types/hazard';

export function isPointInHazardBounds(
  lat: number,
  lng: number,
  hazard: Hazard,
  buffer: number,
): boolean {
  return (
    lat >= hazard.lat - buffer &&
    lat <= hazard.lat + hazard.height + buffer &&
    lng >= hazard.lng - buffer &&
    lng <= hazard.lng + hazard.width + buffer
  );
}
