export const MAP_CENTER: [number, number] = [106.9177, 47.9184]; // [lng, lat] — MapLibre GL order
export const MAP_ZOOM = 15;

export const ORS_API_URL = 'https://api.openrouteservice.org/v2/directions/foot-walking/geojson';
export const OWM_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

export const HAZARD_TILE_OPACITY = 0.45;
export const HAZARD_TILE_WEIGHT = 1;
export const BUFFER_DEG = 0.0002;

export const ICE_RISK_THRESHOLDS = {
  high: -15,
  medium: -5,
} as const;

export const ICE_RISK_LABELS: Record<string, string> = {
  high: 'ӨНДӨР',
  medium: 'ДУНД',
  low: 'БАГА',
};

export const VOLUNTEER_UPDATE_INTERVAL_MS = 4000;
export const VOLUNTEER_NEARBY_KM = 10;
