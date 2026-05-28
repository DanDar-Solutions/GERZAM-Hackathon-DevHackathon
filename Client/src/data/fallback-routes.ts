import type { RouteFeature } from '../lib/route-api';

export const fallbackRoutes: {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  routes: RouteFeature[];
} = {
  origin: { lat: 47.9184, lng: 106.9177 },
  destination: { lat: 47.9172, lng: 106.9215 },
  routes: [
    {
      type: 'Feature',
      properties: {
        summary: { distance: 580, duration: 420 },
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [106.9177, 47.9184],
          [106.9180, 47.9183],
          [106.9185, 47.9181],
          [106.9190, 47.9179],
          [106.9195, 47.9177],
          [106.9200, 47.9176],
          [106.9205, 47.9175],
          [106.9210, 47.9173],
          [106.9215, 47.9172],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        summary: { distance: 720, duration: 540 },
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [106.9177, 47.9184],
          [106.9177, 47.9180],
          [106.9177, 47.9176],
          [106.9177, 47.9172],
          [106.9180, 47.9170],
          [106.9190, 47.9168],
          [106.9200, 47.9167],
          [106.9210, 47.9168],
          [106.9215, 47.9170],
          [106.9215, 47.9172],
        ],
      },
    },
  ],
};
