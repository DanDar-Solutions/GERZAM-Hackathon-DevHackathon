import { useState } from 'react';
import { PROFILES } from '../../types/profile';
import type { ProfileType } from '../../types/profile';
import { VolunteerRegistration } from '../volunteer/VolunteerRegistration';
import '../question/question.css';

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [selected, setSelected] = useState<ProfileType | null>(null);
  const [showVolunteerReg, setShowVolunteerReg] = useState(false);

  const handleContinue = () => {
    if (!selected) return;
    localStorage.setItem('accessub-splash', selected);
    onDone();
  };

  if (showVolunteerReg) {
    return <VolunteerRegistration onDone={onDone} onBack={() => setShowVolunteerReg(false)} />;
  }

  return (
    <div className="q-page">
      <div className="q-blob q-blob-1" />
      <div className="q-blob q-blob-2" />
      <div className="q-shell">
        <div className="q-header">
          <span className="q-brand">AccessUB</span>
        </div>
        <div className="q-card q-slide-in">
          <div className="q-category-tag">Улаанбаатарыг аюулгүй, саадгүй туулъя</div>
          <h2 className="q-question">Таны хэрэгцээнд тохируулъя</h2>
          <div className="q-options-col">
            {(Object.values(PROFILES) as typeof PROFILES[ProfileType][]).map((p) => (
              <button
                key={p.type}
                className={`splash-profile-card${selected === p.type ? ' splash-profile-card-selected' : ''}`}
                style={{ '--profile-color': p.color } as React.CSSProperties}
                onClick={() => setSelected(p.type)}
              >
                <span className="icon splash-profile-icon">{p.icon}</span>
                <div>
                  <div className="splash-profile-label">{p.label}</div>
                  <div className="splash-profile-desc">{p.description}</div>
                </div>
                {selected === p.type && (
                  <span className="icon splash-check">check_circle</span>
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="q-nav">
          <button
            className="splash-volunteer-btn"
            onClick={() => setShowVolunteerReg(true)}
          >
            <span className="icon">volunteer_activism</span>
            Сайн дурын ажилтан
          </button>
          <button className="q-btn-next" onClick={handleContinue} disabled={!selected}>
            Эхлэх →
          </button>
        </div>
      </div>
    </div>
  );
}
