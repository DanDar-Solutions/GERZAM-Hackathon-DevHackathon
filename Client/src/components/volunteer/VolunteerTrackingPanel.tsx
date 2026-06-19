import { useMemo } from 'react';
import { MiniMap } from './MiniMap';
import { haversineMeters } from '../../lib/haversine';
import { useRequestTracking } from '../../hooks/useHelpRequest';
import { useDragToDismiss } from '../../hooks/useDragToDismiss';
import type { UserLocation } from '../../hooks/useUserLocation';
import './VolunteerTrackingPanel.css';

interface Props {
  requestId: string;
  userLocation: UserLocation | null;
  onClose: () => void;
}

export function VolunteerTrackingPanel({ requestId, userLocation, onClose }: Props) {
  const { requestStatus, volunteerLat, volunteerLng } = useRequestTracking(requestId);
  const { sheetRef, onPointerDown, animatedDismiss } = useDragToDismiss(onClose);

  const distanceM = useMemo(() => {
    if (
      userLocation == null ||
      volunteerLat == null ||
      volunteerLng == null
    ) return null;
    return haversineMeters(userLocation.lat, userLocation.lng, volunteerLat, volunteerLng);
  }, [userLocation, volunteerLat, volunteerLng]);

  const pins = useMemo(() => {
    const list = [];
    if (volunteerLat != null && volunteerLng != null) {
      list.push({ lat: volunteerLat, lng: volunteerLng, color: '#2b6cb0' });
    }
    if (userLocation) {
      list.push({ lat: userLocation.lat, lng: userLocation.lng, color: '#e53e3e' });
    }
    return list;
  }, [volunteerLat, volunteerLng, userLocation]);

  if (requestStatus === 'completed' || requestStatus === 'declined') {
    return (
      <div className="vtp-overlay">
        <div className="vtp-sheet">
          <p className="vtp-done">
            {requestStatus === 'completed'
              ? 'Сайн дурынхан ирлээ. Баярлалаа!'
              : 'Сайн ажилтан татгалзлаа.'}
          </p>
          <button className="vtp-close-btn" onClick={animatedDismiss}>Хаах</button>
        </div>
      </div>
    );
  }

  if (requestStatus === null || requestStatus === 'pending') {
    return (
      <div className="vtp-overlay">
        <div className="vtp-sheet" ref={sheetRef}>
          <div className="sheet-handle" onPointerDown={onPointerDown} />
          <h3 className="vtp-title">Хүсэлт илгээгдлээ</h3>
          <p className="vtp-waiting">Сайн дурын ажилтан хариу өгөхийг хүлээж байна...</p>
          <div className="spinner" style={{ margin: '16px auto' }} />
          <button className="vtp-close-btn" onClick={animatedDismiss}>Цуцлах</button>
        </div>
      </div>
    );
  }

  return (
    <div className="vtp-overlay">
      <div className="vtp-sheet" ref={sheetRef}>
        <div className="sheet-handle" onPointerDown={onPointerDown} />
        <h3 className="vtp-title">Сайн дурын ажилтан очиж байна</h3>

        {distanceM != null ? (
          <div className="vtp-distance">
            <span className="icon vtp-distance-icon">near_me</span>
            <span className="vtp-distance-value">
              {distanceM < 1000
                ? `${Math.round(distanceM)} метр`
                : `${(distanceM / 1000).toFixed(1)} км`}
            </span>
          </div>
        ) : (
          <p className="vtp-waiting">Байршил хүлээж байна...</p>
        )}

        {pins.length > 0 && <MiniMap pins={pins} zoom={15} />}

        <button className="vtp-close-btn" onClick={animatedDismiss}>Хаах</button>
      </div>
    </div>
  );
}
