import { useState, useCallback } from 'react';
import { MAP_CENTER } from '../config/constants';
import type { Hazard } from '../types/hazard';
import type { DemoLocation } from '../types/route';

export type Panel = 'none' | 'report' | 'routes' | 'volunteer';

const DEFAULT_CENTER = { lat: MAP_CENTER[1], lng: MAP_CENTER[0] };

export function useMapState(
  planRoutes: (start: { lat: number; lng: number }, end: { lat: number; lng: number }) => Promise<void>,
  clearRoutes: () => void,
  userLocation: { lat: number; lng: number } | null = null,
) {
  const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);
  const [panel, setPanel] = useState<Panel>('none');
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const noOverlay = panel === 'none';

  const openReport = useCallback(() => setPanel('report'), []);
  const openVolunteer = useCallback(() => setPanel('volunteer'), []);
  const closePanel = useCallback(() => setPanel('none'), []);

  const selectDestination = useCallback(
    (loc: DemoLocation) => {
      setSearchQuery(loc.name);
      setShowSuggestions(false);
      setPanel('routes');
      const start = userLocation ?? DEFAULT_CENTER;
      planRoutes(start, { lat: loc.lat, lng: loc.lng });
    },
    [planRoutes, userLocation],
  );

  const closeRoutes = useCallback(() => {
    setPanel('none');
    setSearchQuery('');
    clearRoutes();
  }, [clearRoutes]);

  const updateSearch = useCallback(
    (val: string) => {
      setSearchQuery(val);
      setShowSuggestions(val.length > 0);
      if (!val) closeRoutes();
    },
    [closeRoutes],
  );

  const focusSearch = useCallback(() => setShowSuggestions(true), []);
  const dismissSuggestions = useCallback(() => setShowSuggestions(false), []);

  return {
    selectedHazard, setSelectedHazard,
    panel, noOverlay,
    mapCenter, setMapCenter,
    searchQuery, showSuggestions,
    openReport, openVolunteer, closePanel,
    selectDestination, closeRoutes,
    updateSearch, focusSearch, dismissSuggestions,
  };
}
