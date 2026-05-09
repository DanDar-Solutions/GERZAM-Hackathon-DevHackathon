import { useEffect, type RefObject } from 'react';
import maplibregl from 'maplibre-gl';
import { HAZARD_TILE_OPACITY, HAZARD_TILE_WEIGHT } from '../config/constants';
import { CATEGORY_COLORS, type Hazard } from '../types/hazard';
import type { ScoredRoute } from '../types/route';

export function hazardsToGeoJSON(hazards: Hazard[]) {
  return {
    type: 'FeatureCollection' as const,
    features: hazards.map((h) => ({
      type: 'Feature' as const,
      id: h.id,
      properties: { id: h.id, severity: h.severity, category: h.category },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [h.lng, h.lat],
          [h.lng + h.width, h.lat],
          [h.lng + h.width, h.lat + h.height],
          [h.lng, h.lat + h.height],
          [h.lng, h.lat],
        ]],
      },
    })),
  };
}

export function routesToGeoJSON(routes: ScoredRoute[]) {
  return {
    type: 'FeatureCollection' as const,
    features: routes.map((route) => ({
      type: 'Feature' as const,
      properties: { isSafer: route.isSafer },
      geometry: route.geometry.geometry,
    })),
  };
}

export function useMapLayers(
  mapRef: RefObject<maplibregl.Map | null>,
  hazardsRef: RefObject<Hazard[]>,
  setSelectedHazardRef: RefObject<(h: Hazard) => void>,
  setMapCenterRef: RefObject<(c: { lat: number; lng: number }) => void>,
) {
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.on('load', () => {
      map.addSource('hazards', {
        type: 'geojson',
        data: hazardsToGeoJSON(hazardsRef.current),
      });
      map.addLayer({
        id: 'hazards-fill',
        type: 'fill',
        source: 'hazards',
        paint: {
          'fill-color': ['match', ['get', 'category'],
            'ice', CATEGORY_COLORS.ice,
            'blocked', CATEGORY_COLORS.blocked,
            'broken', CATEGORY_COLORS.broken,
            'slope', CATEGORY_COLORS.slope,
            CATEGORY_COLORS.broken,
          ] as maplibregl.ExpressionSpecification,
          'fill-opacity': HAZARD_TILE_OPACITY,
        },
      });
      map.addLayer({
        id: 'hazards-outline',
        type: 'line',
        source: 'hazards',
        paint: {
          'line-color': ['match', ['get', 'category'],
            'ice', CATEGORY_COLORS.ice,
            'blocked', CATEGORY_COLORS.blocked,
            'broken', CATEGORY_COLORS.broken,
            'slope', CATEGORY_COLORS.slope,
            CATEGORY_COLORS.broken,
          ] as maplibregl.ExpressionSpecification,
          'line-width': HAZARD_TILE_WEIGHT,
        },
      });

      // Route source + layers (alternative drawn first so safer overlaps it)
      map.addSource('routes', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'routes-alternative',
        type: 'line',
        source: 'routes',
        filter: ['==', ['get', 'isSafer'], false],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#EF4444',
          'line-width': 4,
          'line-opacity': 0.6,
          'line-dasharray': [2, 2],
        },
      });
      map.addLayer({
        id: 'routes-safer',
        type: 'line',
        source: 'routes',
        filter: ['==', ['get', 'isSafer'], true],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#22C55E',
          'line-width': 5,
          'line-opacity': 0.9,
        },
      });

      map.on('moveend', () => {
        const c = map.getCenter();
        setMapCenterRef.current({ lat: c.lat, lng: c.lng });
      });

      map.on('click', 'hazards-fill', (e) => {
        if (!e.features?.length) return;
        const id = e.features[0].properties?.id as string;
        const hazard = hazardsRef.current.find((h) => h.id === id);
        if (hazard) setSelectedHazardRef.current(hazard);
      });

      map.on('mouseenter', 'hazards-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'hazards-fill', () => { map.getCanvas().style.cursor = ''; });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
