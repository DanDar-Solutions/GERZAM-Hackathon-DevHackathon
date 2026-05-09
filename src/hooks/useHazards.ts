import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import type { Hazard } from '../types/hazard';

export function useHazards() {
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function init() {
      const { data, error } = await supabase!.from('hazards').select('*');
      if (!error && data && data.length > 0) {
        setHazards(data as Hazard[]);
      }
      setLoading(false);

      channel = supabase!
        .channel('hazards-realtime')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'hazards' },
          (payload) => {
            setHazards((prev) => [...prev, payload.new as Hazard]);
          }
        )
        .subscribe();
    }

    init();

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, []);

  const addHazard = useCallback(
    async (hazard: Omit<Hazard, 'id' | 'reported_at' | 'report_count' | 'reporter_id'>) => {
      if (!supabase) {
        const local: Hazard = {
          ...hazard,
          id: crypto.randomUUID(),
          reported_at: new Date().toISOString(),
          report_count: 1,
          reporter_id: null,
        };
        setHazards((prev) => [...prev, local]);
        return true;
      }

      const { error } = await supabase.from('hazards').insert({
        ...hazard,
        report_count: 1,
      });

      return !error;
    },
    []
  );

  return { hazards, loading, addHazard };
}
