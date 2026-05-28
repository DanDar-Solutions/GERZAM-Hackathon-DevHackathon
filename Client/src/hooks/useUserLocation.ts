import { useState, useEffect, useRef } from 'react';

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
  heading: number | null;
}

export function useUserLocation(): { location: UserLocation | null; error: string | null } {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(
    () => !navigator.geolocation ? 'Байрлал тодорхойлох боломжгүй' : null,
  );
  const headingRef = useRef<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const gpsHeading = pos.coords.heading != null && !isNaN(pos.coords.heading)
          ? pos.coords.heading
          : null;
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: headingRef.current ?? gpsHeading,
        });
        setError(null);
      },
      () => setError('Байрлал авах үед алдаа гарлаа'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Device orientation for compass heading
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      let heading: number | null = null;

      // iOS Safari provides webkitCompassHeading (degrees from true north)
      const ios = (e as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading;
      if (ios != null && !isNaN(ios)) {
        heading = ios;
      } else if (e.absolute && e.alpha != null) {
        // Android absolute orientation: alpha is CCW from north, convert to CW
        heading = (360 - e.alpha) % 360;
      }

      if (heading != null) {
        headingRef.current = heading;
        setLocation((prev) => prev ? { ...prev, heading } : prev);
      }
    };

    window.addEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
    window.addEventListener('deviceorientation', handleOrientation as EventListener, true);

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation as EventListener, true);
      window.removeEventListener('deviceorientation', handleOrientation as EventListener, true);
    };
  }, []);

  return { location, error };
}
