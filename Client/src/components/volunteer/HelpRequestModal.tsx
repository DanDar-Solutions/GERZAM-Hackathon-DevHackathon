import { useState } from 'react';
import { MiniMap } from './MiniMap';
import type { HelpRequest } from '../../types/volunteer';
import { useDragToDismiss } from '../../hooks/useDragToDismiss';
import './HelpRequestModal.css';

interface Props {
  request: HelpRequest;
  hasCar: boolean;
  onRespond: (accepted: boolean) => Promise<void>;
  onComplete: () => Promise<void>;
}

export function HelpRequestModal({ request, hasCar, onRespond, onComplete }: Props) {
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const { sheetRef, onPointerDown } = useDragToDismiss(() => !accepted && onRespond(false));

  const handleAnswer = async (yes: boolean) => {
    setBusy(true);
    await onRespond(yes);
    setBusy(false);
    if (yes) setAccepted(true);
  };

  const handleDone = async () => {
    setBusy(true);
    await onComplete();
    setBusy(false);
  };

  return (
    <div className="hrm-overlay">
      <div className="hrm-sheet" ref={sheetRef}>
        <div className="sheet-handle" onPointerDown={onPointerDown} />

        {!accepted ? (
          <>
            <h3 className="hrm-title">Туслах хүсэлт ирлээ!</h3>
            <p className="hrm-question">
              {hasCar ? 'Одоо машинаараа явж чадах уу?' : 'Одоо Очиж чадах уу?'}
            </p>
            <div className="hrm-actions">
              <button className="hrm-btn hrm-btn-yes" onClick={() => handleAnswer(true)} disabled={busy}>
                <span className="icon">check_circle</span> Тийм
              </button>
              <button className="hrm-btn hrm-btn-no" onClick={() => handleAnswer(false)} disabled={busy}>
                <span className="icon">cancel</span> Үгүй
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="hrm-title">Хүсэлт хүлээн авлаа</h3>
            <p className="hrm-question">Хэрэглэгчийн байршил:</p>
            <MiniMap
              pins={[{ lat: request.requester_lat, lng: request.requester_lng, color: '#e53e3e' }]}
              zoom={15}
            />
            <button className="hrm-btn hrm-btn-done" onClick={handleDone} disabled={busy} style={{ marginTop: 16 }}>
              <span className="icon">task_alt</span> Дууслаа
            </button>
          </>
        )}
      </div>
    </div>
  );
}
