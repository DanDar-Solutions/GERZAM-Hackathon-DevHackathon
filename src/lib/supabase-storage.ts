import { supabase } from '../config/supabase';

export async function uploadHazardPhoto(file: File): Promise<string | null> {
  if (!supabase) return null;

  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from('hazard-photos')
    .upload(path, file, { contentType: file.type });

  if (error) {
    console.error('Photo upload failed:', error.message);
    return null;
  }

  const { data } = supabase.storage.from('hazard-photos').getPublicUrl(path);
  return data.publicUrl;
}
