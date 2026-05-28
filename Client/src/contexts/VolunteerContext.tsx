import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '../config/supabase';
import type { Volunteer } from '../types/volunteer';

const STORAGE_KEY = 'accessub-volunteer';

interface VolunteerContextValue {
  volunteer: Volunteer | null;
  registerVolunteer: (data: Pick<Volunteer, 'name' | 'register_id' | 'has_car' | 'can_transport'>) => Promise<void>;
  clearVolunteer: () => void;
}

const VolunteerContext = createContext<VolunteerContextValue | null>(null);

function loadFromStorage(): Volunteer | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Volunteer) : null;
  } catch {
    return null;
  }
}

export function VolunteerProvider({ children }: { children: ReactNode }) {
  const [volunteer, setVolunteer] = useState<Volunteer | null>(loadFromStorage);

  const registerVolunteer = useCallback(
    async (data: Pick<Volunteer, 'name' | 'register_id' | 'has_car' | 'can_transport'>) => {
      if (supabase) {
        const { data: row, error } = await supabase
          .from('volunteers')
          .insert({ ...data, is_online: true })
          .select()
          .single();
        if (!error && row) {
          const vol = row as Volunteer;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(vol));
          setVolunteer(vol);
          return;
        }
      }
      // Offline fallback
      const local: Volunteer = {
        id: crypto.randomUUID(),
        ...data,
        is_online: true,
        lat: null,
        lng: null,
        last_seen: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
      setVolunteer(local);
    },
    [],
  );

  const clearVolunteer = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setVolunteer(null);
  }, []);

  return (
    <VolunteerContext.Provider value={{ volunteer, registerVolunteer, clearVolunteer }}>
      {children}
    </VolunteerContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useVolunteer(): VolunteerContextValue {
  const ctx = useContext(VolunteerContext);
  if (!ctx) throw new Error('useVolunteer must be used inside VolunteerProvider');
  return ctx;
}
