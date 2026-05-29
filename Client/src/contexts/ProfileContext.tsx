import { createContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { ProfileType } from '../types/profile';
import { type AppUser, fetchUserById, saveSurvey } from '../lib/user-api';

export type { AppUser };

export interface ProfileContextValue {
  user: AppUser | null;
  profile: ProfileType | null;
  loading: boolean;
  loginAsGuest: () => void;
  completeSurvey: (answers: Record<string, string>, profileType: ProfileType) => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ProfileContext = createContext<ProfileContextValue>({
  user: null,
  profile: null,
  loading: true,
  loginAsGuest: () => {},
  completeSurvey: async () => {},
});

function saveLocal(user: AppUser, profile: ProfileType | null) {
  localStorage.setItem('accessub-user', JSON.stringify({ ...user, profile }));
  if (profile) localStorage.setItem('accessub-profile', profile);
}

function clearLocal() {
  localStorage.removeItem('accessub-user');
  localStorage.removeItem('accessub-profile');
}

function loadStoredUser(): { user: AppUser; profile: ProfileType | null } | null {
  try {
    const raw = localStorage.getItem('accessub-user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { user: parsed, profile: parsed.profile ?? null };
  } catch {
    return null;
  }
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [stored] = useState(loadStoredUser);
  const [user, setUser] = useState<AppUser | null>(stored?.user ?? null);
  const [profile, setProfile] = useState<ProfileType | null>(stored?.profile ?? null);
  const [loading, setLoading] = useState(stored !== null);

  useEffect(() => {
    if (!stored) return;

    fetchUserById(stored.user.id).then((result) => {
      if (result) {
        setUser(result.user);
        if (result.profile) setProfile(result.profile);
        saveLocal(result.user, result.profile);
      }
      setLoading(false);
    }).catch(() => {
      clearLocal();
      setLoading(false);
    });
  }, [stored]);

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

  return (
    <ProfileContext.Provider value={{ user, profile, loading, loginAsGuest, completeSurvey }}>
      {children}
    </ProfileContext.Provider>
  );
}

