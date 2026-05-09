import { useRef, useEffect, useCallback, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { mapStyle } from '../../config/map-style';
import { MAP_CENTER, MAP_ZOOM, HAZARD_TILE_OPACITY } from '../../config/constants';
import type { ScoredRoute } from '../../types/route';
import { useHazards } from '../../hooks/useHazards';
import { useRoutes } from '../../hooks/useRoutes';
import { useProfile } from '../../hooks/useProfile';
import { useMapState } from '../../hooks/useMapState';
import { useUserLocation } from '../../hooks/useUserLocation';
import { useNavigation } from '../../hooks/useNavigation';
import { useMapLayers, hazardsToGeoJSON, routesToGeoJSON } from '../../hooks/useMapLayers';
import { useVolunteer } from '../../contexts/VolunteerContext';
import { useVolunteerSession } from '../../hooks/useVolunteerSession';
import { useIncomingRequest } from '../../hooks/useHelpRequest';
import { HazardSheet } from '../hazard/HazardSheet';
import { ReportSheet } from '../hazard/ReportSheet';
import { VolunteerModal } from '../volunteer/VolunteerModal';
import { HelpRequestModal } from '../volunteer/HelpRequestModal';
import { VolunteerTrackingPanel } from '../volunteer/VolunteerTrackingPanel';
import { SearchBar } from '../ui/SearchBar';
import { RouteSuggestions } from '../route/RouteSuggestions';
import { RoutePanel } from '../route/RoutePanel';
import { NavigationBanner } from '../route/NavigationBanner';
import { FAB } from '../ui/FAB';
import 'maplibre-gl/dist/maplibre-gl.css';
import './HazardMap.css';

function createLocationMarkerElement(): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'user-dot-wrapper';

  const pulse = document.createElement('div');
  pulse.className = 'user-dot-pulse';

  const cone = document.createElement('div');
  cone.className = 'user-dot-cone';
  cone.style.visibility = 'hidden';

  const dot = document.createElement('div');
  dot.className = 'user-dot';

  wrapper.appendChild(pulse);
  wrapper.appendChild(cone);
  wrapper.appendChild(dot);
  return wrapper;
}

export function HazardMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const flewToUserRef = useRef(false);

  const { hazards, addHazard } = useHazards();
  const { routes, loading: routesLoading, planRoutes, clearRoutes } = useRoutes(hazards);
  const { profile } = useProfile();
  const { location } = useUserLocation();
  const { isNavigating, guidance, nextHazardId, startNavigation, stopNavigation } = useNavigation(hazards, location);

  const { volunteer } = useVolunteer();
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

  // Volunteer session: keeps location in sync and manages online status
  useVolunteerSession(location);

  // Volunteer side: listen for incoming help requests
  const { incomingRequest, respondToRequest, completeRequest } = useIncomingRequest(
    volunteer?.id ?? null,
  );

  const {
    selectedHazard, setSelectedHazard,
    panel, noOverlay,
    mapCenter, setMapCenter,
    searchQuery, showSuggestions,
    openReport, openVolunteer, closePanel,
    selectDestination, closeRoutes,
    updateSearch, focusSearch,
  } = useMapState(planRoutes, clearRoutes, location);

  // Refs so event handlers registered once always see current values
  const hazardsRef = useRef(hazards);
  const setSelectedHazardRef = useRef(setSelectedHazard);
  const setMapCenterRef = useRef(setMapCenter);
  useEffect(() => { hazardsRef.current = hazards; }, [hazards]);
  useEffect(() => { setSelectedHazardRef.current = setSelectedHazard; }, [setSelectedHazard]);
  useEffect(() => { setMapCenterRef.current = setMapCenter; }, [setMapCenter]);

  const handleReport = useCallback(
    async (data: Parameters<typeof addHazard>[0]) => addHazard(data),
    [addHazard],
  );

  const handleStartNav = useCallback(
    (route: ScoredRoute) => {
      startNavigation(route);
      closePanel();
    },
    [startNavigation, closePanel],
  );

  const handleStopNav = useCallback(() => {
    stopNavigation();
    closeRoutes();
  }, [stopNavigation, closeRoutes]);

  const handleRequestSent = useCallback((requestId: string) => {
    setActiveRequestId(requestId);
    closePanel();
  }, [closePanel]);

  // Map init
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle,
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      attributionControl: false,
    });
    mapRef.current = map;

    const el = createLocationMarkerElement();
    markerRef.current = new maplibregl.Marker({ element: el, anchor: 'center' });

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      flewToUserRef.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useMapLayers(mapRef, hazardsRef, setSelectedHazardRef, setMapCenterRef);

  useEffect(() => {
    const source = mapRef.current?.getSource('hazards') as maplibregl.GeoJSONSource | undefined;
    source?.setData(hazardsToGeoJSON(hazards));
  }, [hazards]);

  useEffect(() => {
    const source = mapRef.current?.getSource('routes') as maplibregl.GeoJSONSource | undefined;
    source?.setData(routesToGeoJSON(routes));
  }, [routes]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.getLayer('hazards-fill')) return;
    map.setPaintProperty(
      'hazards-fill',
      'fill-opacity',
      nextHazardId
        ? ['case', ['==', ['get', 'id'], nextHazardId], 0.85, HAZARD_TILE_OPACITY] as maplibregl.ExpressionSpecification
        : HAZARD_TILE_OPACITY,
    );
  }, [nextHazardId]);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!location || !map || !marker) return;

    marker.setLngLat([location.lng, location.lat]);
    if (!marker.getElement().isConnected) marker.addTo(map);

    const cone = marker.getElement().querySelector('.user-dot-cone') as HTMLElement | null;
    if (cone) {
      if (location.heading != null) {
        cone.style.visibility = 'visible';
        cone.style.transform = `rotate(${location.heading}deg)`;
      } else {
        cone.style.visibility = 'hidden';
      }
    }

    if (!flewToUserRef.current) {
      flewToUserRef.current = true;
      map.flyTo({ center: [location.lng, location.lat], zoom: 16, duration: 1200 });
    }
  }, [location]);

  return (
    <div className="hazard-map-container">
      <div ref={containerRef} className="hazard-map" />

      <SearchBar
        value={searchQuery}
        onChange={updateSearch}
        onFocus={focusSearch}
      />

      {showSuggestions && panel !== 'routes' && (
        <RouteSuggestions query={searchQuery} onSelect={selectDestination} />
      )}

      {panel === 'report' && <div className="crosshair">+</div>}

      {isNavigating && (
        <NavigationBanner guidance={guidance} onStop={handleStopNav} />
      )}

      {noOverlay && !isNavigating && (
        <FAB onClick={openReport} />
      )}

      {noOverlay && !isNavigating && !volunteer && (
        <button className="volunteer-map-btn" onClick={openVolunteer}>
          <span className="icon">phone</span> Тусламж дуудах
        </button>
      )}

      {selectedHazard && noOverlay && (
        <HazardSheet
          hazard={selectedHazard}
          onClose={() => setSelectedHazard(null)}
        />
      )}

      {panel === 'report' && (
        <ReportSheet
          mapCenter={mapCenter}
          userLocation={location}
          onSubmit={handleReport}
          onClose={closePanel}
        />
      )}

      {panel === 'routes' && (
        <RoutePanel
          routes={routes}
          loading={routesLoading}
          profile={profile}
          onClose={closeRoutes}
          onCallVolunteer={openVolunteer}
          onStart={handleStartNav}
        />
      )}

      {panel === 'volunteer' && (
        <VolunteerModal
          onClose={closePanel}
          userLat={location?.lat ?? null}
          userLng={location?.lng ?? null}
          onRequestSent={handleRequestSent}
        />
      )}

      {incomingRequest && (
        <HelpRequestModal
          key={incomingRequest.id}
          request={incomingRequest}
          hasCar={volunteer?.has_car ?? false}
          onRespond={respondToRequest}
          onComplete={completeRequest}
        />
      )}

      {activeRequestId && (
        <VolunteerTrackingPanel
          requestId={activeRequestId}
          userLocation={location}
          onClose={() => setActiveRequestId(null)}
        />
      )}
    </div>
  );
}
