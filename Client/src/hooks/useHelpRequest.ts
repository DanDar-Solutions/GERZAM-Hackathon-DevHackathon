import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import type { HelpRequest, Volunteer } from '../types/volunteer';

// ─── Volunteer side: listen for incoming requests ───────────────────────────

export function useIncomingRequest(volunteerId: string | null) {
  const [incomingRequest, setIncomingRequest] = useState<HelpRequest | null>(null);

  useEffect(() => {
    if (!supabase || !volunteerId) return;
    const db = supabase;
    let removed = false;

    const channel = db
      .channel(`help-req-v-${volunteerId}-${Date.now()}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'accessub', table: 'help_requests', filter: `volunteer_id=eq.${volunteerId}` },
        (payload) => {
          if (removed) return;
          const req = payload.new as HelpRequest;
          if (req.status === 'pending') setIncomingRequest(req);
        },
      )
      .subscribe();

    return () => {
      removed = true;
      db.removeChannel(channel);
    };
  }, [volunteerId]);

  const respondToRequest = useCallback(
    async (accepted: boolean) => {
      if (!incomingRequest) return;
      try {
        if (supabase) {
          await supabase
            .from('help_requests')
            .update({ status: accepted ? 'accepted' : 'declined' })
            .eq('id', incomingRequest.id);
        }
      } finally {
        if (!accepted) setIncomingRequest(null);
      }
    },
    [incomingRequest],
  );

  const completeRequest = useCallback(async () => {
    if (!incomingRequest) return;
    try {
      if (supabase) {
        await supabase
          .from('help_requests')
          .update({ status: 'completed' })
          .eq('id', incomingRequest.id);
      }
    } finally {
      setIncomingRequest(null);
    }
  }, [incomingRequest]);

  return { incomingRequest, respondToRequest, completeRequest };
}

// ─── Requester side: track request status + volunteer location ───────────────

export function useRequestTracking(requestId: string | null) {
  const [requestStatus, setRequestStatus] = useState<HelpRequest['status'] | null>(null);
  const [volunteerLat, setVolunteerLat] = useState<number | null>(null);
  const [volunteerLng, setVolunteerLng] = useState<number | null>(null);
  const [volunteerId, setVolunteerId] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !requestId) return;
    const db = supabase;
    let removed = false;

    db.from('help_requests').select('*').eq('id', requestId).single().then(({ data }) => {
      if (removed || !data) return;
      setRequestStatus(data.status);
      setVolunteerId(data.volunteer_id);
    });

    const reqChannel = db
      .channel(`help-req-r-${requestId}-${Date.now()}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'accessub', table: 'help_requests', filter: `id=eq.${requestId}` },
        (payload) => {
          if (removed) return;
          const req = payload.new as HelpRequest;
          setRequestStatus(req.status);
          setVolunteerId(req.volunteer_id);
        },
      )
      .subscribe();

    return () => {
      removed = true;
      db.removeChannel(reqChannel);
    };
  }, [requestId]);

  useEffect(() => {
    if (!supabase || !volunteerId) return;
    const db = supabase;
    let removed = false;

    db.from('volunteers').select('lat,lng').eq('id', volunteerId).single().then(({ data }) => {
      if (removed || !data) return;
      setVolunteerLat(data.lat ?? null);
      setVolunteerLng(data.lng ?? null);
    });

    const volChannel = db
      .channel(`vol-loc-${volunteerId}-${Date.now()}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'accessub', table: 'volunteers', filter: `id=eq.${volunteerId}` },
        (payload) => {
          if (removed) return;
          const vol = payload.new as Volunteer;
          setVolunteerLat(vol.lat ?? null);
          setVolunteerLng(vol.lng ?? null);
        },
      )
      .subscribe();

    return () => {
      removed = true;
      db.removeChannel(volChannel);
    };
  }, [volunteerId]);

  return { requestStatus, volunteerLat, volunteerLng, volunteerId };
}
