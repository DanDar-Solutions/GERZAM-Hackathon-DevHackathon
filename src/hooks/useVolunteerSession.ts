import { useEffect, useRef } from 'react';
import { supabase } from '../config/supabase';
import { VOLUNTEER_UPDATE_INTERVAL_MS } from '../config/constants';
import { useVolunteer } from '../contexts/VolunteerContext';
import type { UserLocation } from './useUserLocation';

export function useVolunteerSession(location: UserLocation | null) {
  const { volunteer } = useVolunteer();
  const locationRef = useRef(location);
  useEffect(() => { locationRef.current = location; }, [location]);

  useEffect(() => {
    if (!volunteer || !supabase) return;
    const db = supabase;
    const id = volunteer.id;

    db.from('volunteers').update({ is_online: true }).eq('id', id);

    const intervalId = setInterval(() => {
      const loc = locationRef.current;
      if (!loc) return;
      db.from('volunteers').update({
        lat: loc.lat,
        lng: loc.lng,
        last_seen: new Date().toISOString(),
      }).eq('id', id);
    }, VOLUNTEER_UPDATE_INTERVAL_MS);

    const goOffline = () => {
      db.from('volunteers').update({ is_online: false }).eq('id', id);
    };

    let hideTimer: ReturnType<typeof setTimeout> | null = null;
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        hideTimer = setTimeout(goOffline, 30000);
      } else {
        if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
      }
    };

    window.addEventListener('beforeunload', goOffline);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('beforeunload', goOffline);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (hideTimer) clearTimeout(hideTimer);
      goOffline();
    };
  }, [volunteer]);
}
