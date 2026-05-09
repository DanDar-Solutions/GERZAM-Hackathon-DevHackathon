import { useWeather } from '../../hooks/useWeather';
import { ICE_RISK_LABELS } from '../../config/constants';
import './WeatherChip.css';

export function WeatherChip() {
  const weather = useWeather();
  const riskLabel = ICE_RISK_LABELS[weather.iceRisk] ?? 'ӨНДӨР';
  return (
    <div className={`weather-chip weather-chip--${weather.iceRisk}`}>
      <span className="weather-chip__badge">{riskLabel}</span>
      <span className="weather-chip__label">Мөсний эрсдэл</span>
      <span className="weather-chip__temp">{weather.temp}°C</span>
    </div>
  );
}
