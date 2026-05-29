import { supabase } from '../config/supabase';
import type { ProfileType } from '../types/profile';

export interface AppUser {
  id: string;
  name: string;
  mongolianId: string;
  surveyCompleted: boolean;
  profile?: ProfileType;
}

interface UserRow {
  id: string;
  name: string;
  mongolian_id: string;
  survey_completed: boolean | null;
  profile_type: string | null;
}

function rowToUser(row: UserRow): { user: AppUser; profile: ProfileType | null } {
  return {
    user: {
      id: row.id,
      name: row.name,
      mongolianId: row.mongolian_id,
      surveyCompleted: row.survey_completed ?? false,
    },
    profile: (row.profile_type as ProfileType) ?? null,
  };
}

/* ── Supabase operations ── */

export async function fetchUserById(id: string): Promise<{ user: AppUser; profile: ProfileType | null } | null> {
  if (!supabase) return null;
  const { data } = await supabase.from('users').select('*').eq('id', id).single();
  return data ? rowToUser(data as UserRow) : null;
}

export async function saveSurvey(
  userId: string,
  answers: Record<string, string>,
  profileType: ProfileType,
): Promise<void> {
  if (!supabase) return;
  await supabase.from('users').update({
    profile_type: profileType,
    age_range: answers.age_range,
    assistive_device: answers.assistive_device,
    main_challenge: answers.main_challenge,
    travel_companion: answers.travel_companion,
    survey_completed: true,
  }).eq('id', userId);
}
