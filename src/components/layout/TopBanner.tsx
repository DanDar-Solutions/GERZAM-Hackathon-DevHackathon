import { useProfile } from '../../hooks/useProfile';
import { useWeather } from '../../hooks/useWeather';
import { PROFILES } from '../../types/profile';
import { ICE_RISK_LABELS } from '../../config/constants';
import './TopBanner.css';

export function TopBanner() {
  const { profile } = useProfile();
  const weather = useWeather();
  const config = profile ? PROFILES[profile] : null;

  const gradient = config?.bannerGradient ?? 'linear-gradient(135deg, #1e293b, #334155)';
  const riskLabel = ICE_RISK_LABELS[weather.iceRisk] ?? 'ӨНДӨР';

  return (
    <div className="top-banner" style={{ background: gradient }}>
      <div className="banner-left">
        <span className="banner-app-name">AccessUB</span>
        {config && <span className="banner-profile"><span className="icon">{config.icon}</span> {config.label}</span>}
      </div>
      <div className="banner-right">
        <span className="banner-weather">
          Мөсний эрсдэл {riskLabel} — Одоо: {weather.temp}°C
        </span>
      </div>
    </div>
  );
}
