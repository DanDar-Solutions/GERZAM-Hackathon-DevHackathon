import { useState, useCallback } from 'react';
import { fetchRoutes, type RouteFeature } from '../lib/route-api';
import { scoreRoute } from '../lib/hazard-scoring';
import type { Hazard } from '../types/hazard';
import type { ScoredRoute } from '../types/route';

export function useRoutes(hazards: Hazard[]) {
  const [routes, setRoutes] = useState<ScoredRoute[]>([]);
  const [loading, setLoading] = useState(false);

  const planRoutes = useCallback(
    async (start: { lat: number; lng: number }, end: { lat: number; lng: number }) => {
      setLoading(true);
      setRoutes([]);

      const features = await fetchRoutes(start, end);
      const scored: ScoredRoute[] = features.map((f: RouteFeature) => ({
        geometry: f,
        distance: f.properties.summary.distance,
        duration: f.properties.summary.duration,
        score: scoreRoute(f.geometry.coordinates, hazards),
        label: '',
        isSafer: false,
      }));

      scored.sort((a, b) => a.score.weightedScore - b.score.weightedScore);
      if (scored.length > 0) {
        scored[0].isSafer = true;
        scored[0].label = 'Аюулгүй маршрут';
      }
      if (scored.length > 1) {
        scored[1].label = 'Шууд маршрут';
      }

      setRoutes(scored);
      setLoading(false);
    },
    [hazards]
  );

  const clearRoutes = useCallback(() => setRoutes([]), []);

  return { routes, loading, planRoutes, clearRoutes };
}
