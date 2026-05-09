import { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import { mapStyle } from '../../config/map-style';

interface Pin {
  lat: number;
  lng: number;
  color?: string;
}

interface MiniMapProps {
  pins: Pin[];
  zoom?: number;
  className?: string;
}

export function MiniMap({ pins, zoom = 15, className }: MiniMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || pins.length === 0) return;
    const first = pins[0];

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle,
      center: [first.lng, first.lat],
      zoom,
      attributionControl: false,
      interactive: false,
    });
    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update markers whenever pins change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    pins.forEach((pin, i) => {
      const el = document.createElement('div');
      el.style.cssText = `
        width: 16px; height: 16px; border-radius: 50%;
        background: ${pin.color ?? (i === 0 ? '#e53e3e' : '#2b6cb0')};
        border: 2.5px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.35);
      `;
      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([pin.lng, pin.lat])
        .addTo(map);
      markersRef.current.push(marker);
    });

    if (pins.length > 0) {
      map.flyTo({ center: [pins[0].lng, pins[0].lat], zoom, duration: 400 });
    }
  }, [pins, zoom]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '200px', borderRadius: '12px', overflow: 'hidden' }}
    />
  );
}
