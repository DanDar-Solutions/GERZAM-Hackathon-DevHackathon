import { supabase } from '../config/supabase';
import type { ProfileType } from '../types/profile';

export interface AppUser {
  id: string;
  name: string;
  mongolianId: string;
  surveyCompleted: boolean;
  profile?: ProfileType;
}

/* ── Mapping from Supabase row → AppUser ── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToUser(row: any): { user: AppUser; profile: ProfileType | null } {
  return {
    user: {
      id: row.id,
      name: row.name,
      mongolianId: row.mongolian_id,
      surveyCompleted: row.survey_completed ?? false,
    },
    profile: row.profile_type ?? null,
  };
}

/* ── Supabase operations ── */

export async function fetchUserById(id: string): Promise<{ user: AppUser; profile: ProfileType | null } | null> {
  if (!supabase) return null;
  const { data } = await supabase.from('users').select('*').eq('id', id).single();
  return data ? rowToUser(data) : null;
}

export async function fetchOrCreateUser(
  name: string,
  mongolianId: string,
): Promise<{ user: AppUser; profile: ProfileType | null }> {
  if (!supabase) {
    return {
      user: { id: crypto.randomUUID(), name, mongolianId, surveyCompleted: false },
      profile: null,
    };
  }

  // Try to find existing user
  const { data: existing } = await supabase
    .from('users').select('*').eq('mongolian_id', mongolianId).single();

  if (existing) return rowToUser(existing);

  // Create new user
  const { data: created, error } = await supabase
    .from('users').insert({ name, mongolian_id: mongolianId }).select().single();

  if (error) throw new Error('Бүртгэл амжилтгүй боллоо');
  return rowToUser(created);
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
