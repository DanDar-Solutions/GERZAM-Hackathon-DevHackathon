import { createContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { ProfileType } from '../types/profile';
import { type AppUser, fetchUserById, fetchOrCreateUser, saveSurvey } from '../lib/user-api';

export type { AppUser };

export interface ProfileContextValue {
  user: AppUser | null;
  profile: ProfileType | null;
  loading: boolean;
  login: (name: string, mongolianId: string) => Promise<void>;
  loginAsGuest: () => void;
  completeSurvey: (answers: Record<string, string>, profileType: ProfileType) => Promise<void>;
  selectProfile: (p: ProfileType) => void;
  logout: () => void;
}

export const ProfileContext = createContext<ProfileContextValue>({
  user: null,
  profile: null,
  loading: true,
  login: async () => {},
  loginAsGuest: () => {},
  completeSurvey: async () => {},
  selectProfile: () => {},
  logout: () => {},
});

function saveLocal(user: AppUser, profile: ProfileType | null) {
  localStorage.setItem('accessub-user', JSON.stringify({ ...user, profile }));
  if (profile) localStorage.setItem('accessub-profile', profile);
}

function clearLocal() {
  localStorage.removeItem('accessub-user');
  localStorage.removeItem('accessub-profile');
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage, sync with Supabase if available
  useEffect(() => {
    const stored = localStorage.getItem('accessub-user');
    if (!stored) { setLoading(false); return; }

    try {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      if (parsed.profile) setProfile(parsed.profile);

      fetchUserById(parsed.id).then((result) => {
        if (result) {
          setUser(result.user);
          if (result.profile) setProfile(result.profile);
          saveLocal(result.user, result.profile);
        }
        setLoading(false);
      });
    } catch {
      clearLocal();
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (name: string, mongolianId: string) => {
    const { user: u, profile: p } = await fetchOrCreateUser(name, mongolianId);
    setUser(u);
    if (p) setProfile(p);
    saveLocal(u, p);
  }, []);

  const loginAsGuest = useCallback(() => {
    const u: AppUser = { id: crypto.randomUUID(), name: 'Зочин', mongolianId: '', surveyCompleted: false };
    setUser(u);
    saveLocal(u, null);
  }, []);

  const completeSurvey = useCallback(async (answers: Record<string, string>, profileType: ProfileType) => {
    if (!user) return;
    await saveSurvey(user.id, answers, profileType);

    const updated = { ...user, surveyCompleted: true };
    setUser(updated);
    setProfile(profileType);
    saveLocal(updated, profileType);
  }, [user]);

  const selectProfile = useCallback((p: ProfileType) => {
    setProfile(p);
    localStorage.setItem('accessub-profile', p);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setProfile(null);
    clearLocal();
  }, []);

  return (
    <ProfileContext.Provider value={{ user, profile, loading, login, loginAsGuest, completeSurvey, selectProfile, logout }}>
      {children}
    </ProfileContext.Provider>
  );
}

