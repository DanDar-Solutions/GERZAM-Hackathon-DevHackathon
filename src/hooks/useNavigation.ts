import { useState, useEffect, useCallback } from 'react';
import { findHazardsAhead, formatGuidance } from '../lib/navigation';
import type { ScoredRoute } from '../types/route';
import type { Hazard } from '../types/hazard';
import type { UserLocation } from './useUserLocation';

export function useNavigation(hazards: Hazard[], location: UserLocation | null) {
  const [route, setRoute] = useState<ScoredRoute | null>(null);
  const [guidance, setGuidance] = useState<string | null>(null);
  const [nextHazardId, setNextHazardId] = useState<string | null>(null);

  const startNavigation = useCallback((r: ScoredRoute) => {
    setRoute(r);
    setGuidance('Маршрут эхэллээ');
    setNextHazardId(null);
  }, []);

  const stopNavigation = useCallback(() => {
    setRoute(null);
    setGuidance(null);
    setNextHazardId(null);
  }, []);

  useEffect(() => {
    if (!route || !location) return;

    const coords = route.geometry.geometry.coordinates as [number, number][];
    const ahead = findHazardsAhead(location.lat, location.lng, coords, hazards);

    if (ahead.length === 0) {
      setGuidance('Маршрутад аюул байхгүй');
      setNextHazardId(null);
    } else {
      setGuidance(formatGuidance(ahead[0]));
      setNextHazardId(ahead[0].hazard.id);
    }
  }, [location, route, hazards]);

  return {
    isNavigating: route !== null,
    guidance,
    nextHazardId,
    startNavigation,
    stopNavigation,
  };
}
