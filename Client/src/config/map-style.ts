import type { StyleSpecification } from 'maplibre-gl';

export const mapStyle: StyleSpecification = {
  version: 8,
  name: 'AccessUB Minimal',
  sources: {
    openmaptiles: {
      type: 'vector',
      url: 'https://tiles.openfreemap.org/planet',
    },
  },
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#F5F3EE' },
    },
    {
      id: 'water',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'water',
      paint: { 'fill-color': '#C9D8E3' },
    },
    {
      id: 'building-fill',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'building',
      paint: {
        'fill-color': '#E2DFD9',
        'fill-outline-color': '#D0CCC4',
      },
    },
    // Motor roads — faint, just for orientation
    {
      id: 'road-motor',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: [
        'match',
        ['get', 'class'],
        ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'minor', 'residential', 'service'],
        true,
        false,
      ],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#D4D0C8',
        'line-width': ['interpolate', ['linear'], ['zoom'], 12, 1, 17, 3],
      },
    },
    // Footways, paths, steps — the primary walking infrastructure
    {
      id: 'road-footway',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: [
        'match',
        ['get', 'class'],
        ['footway', 'path', 'track', 'steps'],
        true,
        false,
      ],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#B8A898',
        'line-width': ['interpolate', ['linear'], ['zoom'], 14, 1.5, 18, 2.5],
      },
    },
    // Pedestrian streets/plazas
    {
      id: 'road-pedestrian',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', ['get', 'class'], 'pedestrian'],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#A89888',
        'line-width': ['interpolate', ['linear'], ['zoom'], 14, 2, 18, 3],
      },
    },
    // Crossings
    {
      id: 'road-crossing',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', ['get', 'class'], 'crossing'],
      layout: { 'line-cap': 'butt', 'line-join': 'miter' },
      paint: {
        'line-color': '#A89888',
        'line-width': 2,
        'line-dasharray': [1, 2],
      },
    },
    // Road name labels
    {
      id: 'road-label',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'transportation_name',
      layout: {
        'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']],
        'text-font': ['Noto Sans Regular'],
        'text-size': 11,
        'symbol-placement': 'line',
        'text-max-angle': 30,
        'text-padding': 2,
      },
      paint: {
        'text-color': '#888070',
        'text-halo-color': '#F5F3EE',
        'text-halo-width': 1.5,
      },
    },
    // Place labels (neighbourhoods, suburbs)
    {
      id: 'place-label',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      filter: ['match', ['get', 'class'], ['neighbourhood', 'suburb', 'quarter'], true, false],
      minzoom: 13,
      layout: {
        'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']],
        'text-font': ['Noto Sans Regular'],
        'text-size': 11,
        'text-anchor': 'center',
      },
      paint: {
        'text-color': '#5A5550',
        'text-halo-color': '#F5F3EE',
        'text-halo-width': 1.5,
      },
    },
    // Building name labels
    {
      id: 'building-label',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'building',
      minzoom: 16,
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['Noto Sans Regular'],
        'text-size': 11,
        'text-anchor': 'center',
      },
      paint: {
        'text-color': '#5A5550',
        'text-halo-color': '#F5F3EE',
        'text-halo-width': 1.5,
      },
    },
  ],
};
