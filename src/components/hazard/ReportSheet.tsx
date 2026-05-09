import { useState, useRef } from 'react';
import type { HazardCategory } from '../../types/hazard';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../../types/hazard';
import { uploadHazardPhoto } from '../../lib/supabase-storage';
import { useDragToDismiss } from '../../hooks/useDragToDismiss';
import './ReportSheet.css';

type SubmitData = {
  lat: number; lng: number;
  width: number; height: number;
  category: HazardCategory;
  severity: 'medium';
  source: 'user';
  photo_url: string | null;
};

const HAZARD_DEFAULTS = { width: 0.0003, height: 0.0003, severity: 'medium' as const, source: 'user' as const };
const categories: HazardCategory[] = ['ice', 'broken', 'blocked', 'slope'];

interface ReportSheetProps {
  mapCenter: { lat: number; lng: number };
  userLocation?: { lat: number; lng: number } | null;
  onSubmit: (data: SubmitData) => Promise<boolean>;
  onClose: () => void;
}

export function ReportSheet({ mapCenter, userLocation, onSubmit, onClose }: ReportSheetProps) {
  const [category, setCategory] = useState<HazardCategory | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { sheetRef, onPointerDown, animatedDismiss } = useDragToDismiss(onClose);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit() {
    if (!category) return;
    setSubmitting(true);

    let photoUrl: string | null = null;
    if (photo) {
      photoUrl = await uploadHazardPhoto(photo);
    }

    const pos = userLocation ?? mapCenter;
    const ok = await onSubmit({ lat: pos.lat, lng: pos.lng, ...HAZARD_DEFAULTS, category, photo_url: photoUrl });

    setSubmitting(false);
    if (ok) {
      setSubmitted(true);
      setTimeout(onClose, 1500);
    }
  }

  if (submitted) {
    return (
      <div className="sheet-backdrop" onClick={animatedDismiss}>
        <div className="sheet report-sheet" onClick={(e) => e.stopPropagation()}>
          <div className="report-success">
            <span className="report-success-icon icon">check_circle</span>
            <p>Мэдээлэл илгээгдлээ — Баярлалаа!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet report-sheet" ref={sheetRef} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" onPointerDown={onPointerDown} />
        <h3 className="report-title">Аюул мэдээлэх</h3>

        <button
          className="report-photo-btn"
          onClick={() => fileRef.current?.click()}
        >
          {photoPreview ? (
            <img src={photoPreview} alt="Preview" className="report-photo-preview" />
          ) : (
            <span><span className="icon">photo_camera</span> Зураг авах / сонгох</span>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhoto}
          hidden
        />

        <div className="report-categories">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`report-cat-btn ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              <span className="icon">{CATEGORY_ICONS[cat]}</span>
              <span>{CATEGORY_LABELS[cat]}</span>
            </button>
          ))}
        </div>

        <div className="report-location-hint">
          <span className="icon">location_on</span>
          {userLocation ? 'Таны одоогийн байрлалд бүртгэнэ' : 'Газрын зургийн төвд байрлуулна'}
        </div>

        <button
          className="report-submit-btn"
          disabled={!category || submitting}
          onClick={handleSubmit}
        >
          {submitting ? 'Илгээж байна...' : 'Илгээх'}
        </button>
      </div>
    </div>
  );
}
