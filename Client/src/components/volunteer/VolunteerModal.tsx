import { useState, useCallback, useRef } from 'react';
import { supabase } from '../../config/supabase';
import { useVolunteers } from '../../hooks/useVolunteers';
import type { VolunteerWithDistance } from '../../hooks/useVolunteers';
import { useDragToDismiss } from '../../hooks/useDragToDismiss';
import { formatDistanceApprox } from '../../lib/formatting';
import './VolunteerModal.css';

interface VolunteerModalProps {
  onClose: () => void;
  userLat: number | null;
  userLng: number | null;
  onRequestSent: (requestId: string) => void;
}

export function VolunteerModal({ onClose, userLat, userLng, onRequestSent }: VolunteerModalProps) {
  const { volunteers, loading } = useVolunteers(userLat, userLng);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [calling, setCalling] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { sheetRef, onPointerDown, animatedDismiss } = useDragToDismiss(onClose);

  const selectedVol = volunteers.find((v) => v.id === selected) ?? null;

  const handleCall = useCallback(async () => {
    if (!selectedVol) return;
    setCalling(true);
    try {
      if (supabase && userLat != null && userLng != null) {
        const { data, error } = await supabase
          .from('help_requests')
          .insert({
            requester_lat: userLat,
            requester_lng: userLng,
            volunteer_id: selectedVol.id,
            status: 'pending',
          })
          .select()
          .single();
        if (!error && data) {
          setConfirmed(true);
          closeTimer.current = setTimeout(() => {
            onClose();
            onRequestSent(data.id as string);
          }, 2500);
          return;
        }
      }
      // Offline / no Supabase: just show confirmed
      setConfirmed(true);
      closeTimer.current = setTimeout(onClose, 2500);
    } finally {
      setCalling(false);
    }
  }, [selectedVol, userLat, userLng, onClose, onRequestSent]);

  const vehicleLabel = (v: VolunteerWithDistance) => {
    if (v.has_car && v.can_transport) return { icon: 'airport_shuttle', text: 'Машин — тэргэнцэрийн зориулалттай', accessible: true };
    if (v.has_car) return { icon: 'directions_car', text: 'Машин — тэргэнцэрийн зориулалтгүй', accessible: false };
    return { icon: 'directions_walk', text: 'Явган явна', accessible: false };
  };

  return (
    <div className="sheet-backdrop" onClick={animatedDismiss}>
      <div className="sheet volunteer-sheet" ref={sheetRef} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" onPointerDown={onPointerDown} />

        {loading ? (
          <div className="volunteer-loading">
            <div className="spinner" />
            <p>Хайж байна...</p>
          </div>
        ) : (
          <div className="volunteer-results">
            {volunteers.length === 0 ? (
              <>
                <h3 className="volunteer-title">Ойролцоо идэвхтэй сайн дурынхан олдсонгүй</h3>
                <button className="sheet-close-btn" onClick={animatedDismiss}>Хаах</button>
              </>
            ) : (
              <>
                <h3 className="volunteer-title">Сайн дурын ажилтан олдлоо!</h3>

                {volunteers.map((v, i) => {
                  const veh = vehicleLabel(v);
                  return (
                    <div key={v.id}>
                      <div
                        className={`volunteer-card${selected === v.id ? ' selected' : ''}`}
                        onClick={() => !confirmed && setSelected(v.id)}
                      >
                        <div className="volunteer-avatar"><span className="icon">person</span></div>
                        <div className="volunteer-info">
                          <div className="volunteer-name">{v.name}</div>
                          <div className="volunteer-meta">{formatDistanceApprox(v.distanceM)}</div>
                        </div>
                      </div>
                      <div className={`volunteer-vehicle${veh.accessible ? ' accessible' : ''}`}>
                        <span className="icon">{veh.icon}</span> {veh.text}
                      </div>
                      {i < volunteers.length - 1 && <div className="volunteer-divider" />}
                    </div>
                  );
                })}

                {confirmed && selectedVol ? (
                  <p className="volunteer-status">{selectedVol.name}</p>
                ) : selected ? (
                  <button className="volunteer-call-btn" onClick={handleCall} disabled={calling}>
                    {calling ? 'Холбогдож байна...' : 'Дуудах'}
                  </button>
                ) : null}

                {!confirmed && <button className="sheet-close-btn" onClick={animatedDismiss}>Хаах</button>}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
