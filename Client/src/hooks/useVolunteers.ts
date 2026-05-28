import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { haversineMeters } from '../lib/haversine';
import { VOLUNTEER_NEARBY_KM } from '../config/constants';
import type { Volunteer } from '../types/volunteer';

const STALE_MS = 2 * 60 * 1000;

export type VolunteerWithDistance = Volunteer & { distanceM: number | null };

export function useVolunteers(userLat: number | null, userLng: number | null) {
  const [volunteers, setVolunteers] = useState<VolunteerWithDistance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase
      .from('volunteers')
      .select('*')
      .eq('is_online', true)
      .then(({ data }) => {
        if (!data) { setLoading(false); return; }

        const now = Date.now();
        const withDist: VolunteerWithDistance[] = data
          .filter((v: Volunteer) => now - new Date(v.last_seen).getTime() < STALE_MS)
          .map((v: Volunteer) => ({
            ...v,
            distanceM:
              userLat != null && userLng != null && v.lat != null && v.lng != null
                ? haversineMeters(userLat, userLng, v.lat, v.lng)
                : null,
          }));

        const nearby =
          userLat != null && userLng != null
            ? withDist.filter((v) => v.distanceM == null || v.distanceM <= VOLUNTEER_NEARBY_KM * 1000)
            : withDist;

        nearby.sort((a, b) => {
          if (a.distanceM == null && b.distanceM == null) return 0;
          if (a.distanceM == null) return 1;
          if (b.distanceM == null) return -1;
          return a.distanceM - b.distanceM;
        });

        setVolunteers(nearby);
        setLoading(false);
      });
  }, [userLat, userLng]);

  return { volunteers, loading };
}
