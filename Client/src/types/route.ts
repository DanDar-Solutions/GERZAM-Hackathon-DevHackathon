import type { HazardCategory } from './hazard';
import type { LineString } from 'geojson';

export interface DemoLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface RouteScore {
  totalHazards: number;
  weightedScore: number;
  hazardsByCategory: Record<HazardCategory, number>;
}

export interface ScoredRoute {
  geometry: {
    type: string;
    properties: { summary: { distance: number; duration: number } };
    geometry: LineString;
  };
  distance: number;
  duration: number;
  score: RouteScore;
  label: string;
  isSafer: boolean;
}
