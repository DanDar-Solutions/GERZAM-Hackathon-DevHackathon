import type { ScoredRoute } from '../../types/route';
import type { ProfileType } from '../../types/profile';
import type { HazardCategory } from '../../types/hazard';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../../types/hazard';
import './RouteCard.css';

interface RouteCardProps {
  route: ScoredRoute;
  profile: ProfileType | null;
}

function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  return `${mins} мин`;
}

function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} км`;
  return `${Math.round(meters)} м`;
}

const PROFILE_WARNINGS: Record<ProfileType, { category: HazardCategory; msg: (n: number) => string }[]> = {
  wheelchair: [
    { category: 'slope',   msg: (n) => `Налуу хэсэг (${n}) — зөвлөхгүй` },
    { category: 'ice',     msg: (n) => `Мөс (${n}) — аюултай` },
    { category: 'broken',  msg: (n) => `Эвдэрсэн зам (${n}) — болгоомжтой` },
  ],
  elderly: [
    { category: 'ice',     msg: (n) => `Мөс (${n}) — болгоомжтой` },
    { category: 'slope',   msg: (n) => `Налуу хэсэг (${n}) — болгоомжтой` },
    { category: 'broken',  msg: (n) => `Эвдэрсэн зам (${n}) — анхааруулга` },
  ],
  visual: [
    { category: 'blocked', msg: (n) => `Хаалттай хэсэг (${n}) — анхааруулга` },
    { category: 'broken',  msg: (n) => `Эвдэрсэн зам (${n}) — болгоомжтой` },
    { category: 'ice',     msg: (n) => `Мөс (${n}) — болгоомжтой` },
  ],
};

function getProfileWarnings(route: ScoredRoute, profile: ProfileType | null): { category: HazardCategory; text: string }[] {
  if (!profile) return [];
  const { hazardsByCategory } = route.score;
  return (PROFILE_WARNINGS[profile] ?? [])
    .filter((w) => hazardsByCategory[w.category] > 0)
    .map((w) => ({ category: w.category, text: w.msg(hazardsByCategory[w.category]) }));
}

export function RouteCard({ route, profile }: RouteCardProps) {
  const warnings = getProfileWarnings(route, profile);
  const cats = Object.entries(route.score.hazardsByCategory)
    .filter(([, count]) => count > 0)
    .map(([cat, count]) => `${CATEGORY_LABELS[cat as HazardCategory]} ${count}`)
    .join(', ');

  return (
    <div className={`route-card ${route.isSafer ? 'safer' : 'risky'}`}>
      <div className="route-card-header">
        <span className={`route-label ${route.isSafer ? 'safer' : 'risky'}`}>
          {route.label}
        </span>
        <span className="route-hazard-count">
          {route.score.totalHazards} аюул
        </span>
      </div>
      <div className="route-card-stats">
        <span><span className="icon">directions_walk</span> {formatDuration(route.duration)}</span>
        <span><span className="icon">straighten</span> {formatDistance(route.distance)}</span>
      </div>
      {cats && <div className="route-card-cats">{cats}</div>}
      {warnings.map((w, i) => (
        <div key={i} className="route-card-warning">
          <span className="icon">{CATEGORY_ICONS[w.category]}</span> {w.text}
        </div>
      ))}
    </div>
  );
}
