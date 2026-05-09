import './NavigationBanner.css';

interface NavigationBannerProps {
  guidance: string | null;
  onStop: () => void;
}

export function NavigationBanner({ guidance, onStop }: NavigationBannerProps) {
  return (
    <div className="nav-banner">
      <span className="icon nav-banner-icon">navigation</span>
      <p className="nav-banner-text">{guidance ?? 'Маршрут дагаж явж байна...'}</p>
      <button className="nav-banner-stop" onClick={onStop} aria-label="Зогсох">
        <span className="icon">stop_circle</span>
      </button>
    </div>
  );
}
