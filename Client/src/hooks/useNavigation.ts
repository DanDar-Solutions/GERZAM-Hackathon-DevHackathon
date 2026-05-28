import { useState, useMemo, useCallback } from 'react';
import { findHazardsAhead, formatGuidance } from '../lib/navigation';
import type { ScoredRoute } from '../types/route';
import type { Hazard } from '../types/hazard';
import type { UserLocation } from './useUserLocation';

export function useNavigation(hazards: Hazard[], location: UserLocation | null) {
  const [route, setRoute] = useState<ScoredRoute | null>(null);

  const { guidance, nextHazardId } = useMemo(() => {
    if (!route) return { guidance: null, nextHazardId: null };
    if (!location) return { guidance: 'Маршрут эхэллээ' as string | null, nextHazardId: null };

    const coords = route.geometry.geometry.coordinates as [number, number][];
    const ahead = findHazardsAhead(location.lat, location.lng, coords, hazards);

    if (ahead.length === 0) {
      return { guidance: 'Маршрутад аюул байхгүй', nextHazardId: null };
    }
    return { guidance: formatGuidance(ahead[0]), nextHazardId: ahead[0].hazard.id };
  }, [route, location, hazards]);

  const startNavigation = useCallback((r: ScoredRoute) => setRoute(r), []);
  const stopNavigation = useCallback(() => setRoute(null), []);

  return {
    isNavigating: route !== null,
    guidance,
    nextHazardId,
    startNavigation,
    stopNavigation,
  };
}
