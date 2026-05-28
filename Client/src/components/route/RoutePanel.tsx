import type { ScoredRoute } from '../../types/route';
import type { ProfileType } from '../../types/profile';
import { useVolunteer } from '../../contexts/VolunteerContext';
import { RouteCard } from './RouteCard';
import './RoutePanel.css';

interface RoutePanelProps {
  routes: ScoredRoute[];
  loading: boolean;
  profile: ProfileType | null;
  onClose: () => void;
  onCallVolunteer: () => void;
  onStart?: (route: ScoredRoute) => void;
}

export function RoutePanel({ routes, loading, profile, onClose, onCallVolunteer, onStart }: RoutePanelProps) {
  const { volunteer } = useVolunteer();
  const saferRoute = routes.find((r) => r.isSafer) ?? routes[0];

  return (
    <div className="route-panel">
      <div className="route-panel-header">
        <h3>Маршрут</h3>
        <button className="route-panel-close" onClick={onClose}><span className="icon">close</span></button>
      </div>

      {loading && (
        <div className="route-panel-loading">Маршрут хайж байна...</div>
      )}

      <div className="route-panel-cards">
        {routes.map((r, i) => (
          <RouteCard key={i} route={r} profile={profile} />
        ))}
      </div>

      {routes.length > 0 && (
        <div className="route-panel-actions">
          <button
            className="route-start-btn"
            onClick={() => saferRoute && onStart?.(saferRoute)}
          >
            Эхлэх
          </button>
          {!volunteer && (
            <button className="route-volunteer-btn" onClick={onCallVolunteer}>
              Аюултай юу? Сайн дурын ажилтан дуудах
            </button>
          )}
        </div>
      )}
    </div>
  );
}
