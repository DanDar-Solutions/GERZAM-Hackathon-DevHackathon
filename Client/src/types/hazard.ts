export type HazardCategory = 'ice' | 'broken' | 'blocked' | 'slope';
export type Severity = 'low' | 'medium' | 'high';
export type HazardSource = 'seed' | 'user';

export interface Hazard {
  id: string;
  lat: number;
  lng: number;
  width: number;
  height: number;
  category: HazardCategory;
  severity: Severity;
  reported_at: string;
  report_count: number;
  source: HazardSource;
  photo_url: string | null;
  reporter_id: string | null;
}

export const CATEGORY_LABELS: Record<HazardCategory, string> = {
  ice: 'Мөс',
  broken: 'Эвдэрсэн',
  blocked: 'Хаалттай',
  slope: 'Налуу',
};

export const CATEGORY_ICONS: Record<HazardCategory, string> = {
  ice: 'ac_unit',
  broken: 'warning',
  blocked: 'construction',
  slope: 'stairs',
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  low: 'Бага',
  medium: 'Дунд',
  high: 'Өндөр',
};

export const SEVERITY_COLORS: Record<Severity, string> = {
  low: '#22C55E',
  medium: '#F97316',
  high: '#EF4444',
};

export const CATEGORY_COLORS: Record<HazardCategory, string> = {
  ice: '#5BA4CF',
  blocked: '#374151',
  broken: '#F97316',
  slope: '#7EC8A0',
};
