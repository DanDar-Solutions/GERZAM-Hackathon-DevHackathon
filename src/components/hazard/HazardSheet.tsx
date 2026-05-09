import type { Hazard } from '../../types/hazard';
import { CATEGORY_LABELS, CATEGORY_ICONS, SEVERITY_LABELS, SEVERITY_COLORS } from '../../types/hazard';
import './HazardSheet.css';

interface HazardSheetProps {
  hazard: Hazard;
  onClose: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Саяхан';
  if (hours < 24) return `${hours} цагийн өмнө`;
  const days = Math.floor(hours / 24);
  return `${days} өдрийн өмнө`;
}

export function HazardSheet({ hazard, onClose }: HazardSheetProps) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />

        <div className="sheet-header">
          <span className="sheet-icon icon">{CATEGORY_ICONS[hazard.category]}</span>
          <div>
            <h3 className="sheet-title">{CATEGORY_LABELS[hazard.category]}</h3>
            <span
              className="sheet-severity"
              style={{ color: SEVERITY_COLORS[hazard.severity] }}
            >
              {SEVERITY_LABELS[hazard.severity]}
            </span>
          </div>
        </div>

        <div className="sheet-details">
          <div className="sheet-detail-row">
            <span className="sheet-detail-label">Мэдээлсэн:</span>
            <span>{timeAgo(hazard.reported_at)}</span>
          </div>
          <div className="sheet-detail-row">
            <span className="sheet-detail-label">Баталгаажуулалт:</span>
            <span>{hazard.report_count} хэрэглэгч</span>
          </div>
          <div className="sheet-detail-row">
            <span className="sheet-detail-label">Эх сурвалж:</span>
            <span>{hazard.source === 'seed' ? 'CCTV илрүүлэлт' : 'Хэрэглэгчийн мэдээлэл'}</span>
          </div>
        </div>

        {hazard.photo_url && (
          <img src={hazard.photo_url} alt="Аюулын зураг" className="sheet-photo" />
        )}

        <button className="sheet-close-btn" onClick={onClose}>
          Хаах
        </button>
      </div>
    </div>
  );
}
