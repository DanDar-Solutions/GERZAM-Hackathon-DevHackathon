import { useState, useEffect } from 'react';
import { useVolunteer } from '../../contexts/VolunteerContext';
import '../question/question.css';
import './VolunteerRegistration.css';

interface Props {
  onDone: () => void;
}

export function VolunteerRegistration({ onDone }: Props) {
  const { registerVolunteer } = useVolunteer();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [name, setName] = useState('');
  const [registerId, setRegisterId] = useState('');
  const [hasCar, setHasCar] = useState<boolean | null>(null);
  const [canTransport, setCanTransport] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // On entering step 4: save to DB then navigate
  useEffect(() => {
    if (step !== 4) return;
    let navTimer: ReturnType<typeof setTimeout>;
    setSubmitting(true);
    registerVolunteer({
      name: name.trim(),
      register_id: registerId.trim(),
      has_car: hasCar ?? false,
      can_transport: canTransport ?? false,
    }).then(() => {
      setSubmitting(false);
      navTimer = setTimeout(onDone, 2000);
    });
    return () => clearTimeout(navTimer);
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const goToStep4 = () => setStep(4);

  const handleStep3Answer = (answer: boolean) => {
    setHasCar(answer);
    if (!answer) {
      setCanTransport(false);
      goToStep4();
    }
  };

  const TOTAL = 4;
  const progress = (step / TOTAL) * 100;

  return (
    <div className="vol-reg-overlay">
      <div className="q-blob q-blob-1" />
      <div className="q-blob q-blob-2" />
      <div className="q-shell">
        <div className="q-header">
          <span className="q-brand">AccessUB</span>
          <span className="q-step-badge">{step} / {TOTAL}</span>
        </div>
        <div className="q-progress-track">
          <div className="q-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {step === 1 && (
          <div className="q-card q-slide-in" key="step1">
            <div className="q-category-tag">Бүртгэл</div>
            <h2 className="q-question">Таны мэдээлэл</h2>
            <div className="q-auth-form">
              <div className="q-input-group">
                <label className="q-label">Нэр</label>
                <input
                  className="q-input"
                  placeholder="Өөрийн нэрийг оруулна уу"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="q-input-group">
                <label className="q-label">Регистрийн дугаар</label>
                <input
                  className="q-input"
                  placeholder="АА00000000"
                  value={registerId}
                  onChange={(e) => setRegisterId(e.target.value.toUpperCase())}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="q-card q-slide-in" key="step2">
            <div className="q-category-tag">Баталгаажуулах</div>
            <h2 className="q-question">Зөв үү?</h2>
            <div className="vol-reg-confirm">
              <div className="vol-reg-confirm-row">
                <span className="vol-reg-confirm-label">Нэр</span>
                <span className="vol-reg-confirm-value">{name}</span>
              </div>
              <div className="vol-reg-confirm-row">
                <span className="vol-reg-confirm-label">Регистрийн дугаар</span>
                <span className="vol-reg-confirm-value vol-reg-confirm-id">{registerId}</span>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="q-card q-slide-in" key="step3">
            <div className="q-category-tag">Тээврийн хэрэгсэл</div>
            <h2 className="q-question">
              {hasCar === null
                ? 'Танд машин байна уу?'
                : 'Хүн тээвэрлэх боломжтой юу?'}
            </h2>
            <div className="q-options-col">
              {hasCar === null ? (
                <>
                  <button className="q-option" onClick={() => handleStep3Answer(true)}>
                    <span className="icon">directions_car</span> Тийм
                  </button>
                  <button className="q-option" onClick={() => handleStep3Answer(false)}>
                    <span className="icon">directions_walk</span> Үгүй
                  </button>
                </>
              ) : (
                <>
                  <button className="q-option" onClick={() => { setCanTransport(true); goToStep4(); }}>
                    <span className="icon">airline_seat_recline_normal</span> Тийм
                  </button>
                  <button className="q-option" onClick={() => { setCanTransport(false); goToStep4(); }}>
                    <span className="icon">do_not_disturb</span> Үгүй
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="q-card q-slide-in vol-reg-thankyou" key="step4">
            <span className="icon vol-reg-heart">volunteer_activism</span>
            <h2 className="q-question">Хүмүүст туслаж байгаад баярлалаа</h2>
            {submitting && <div className="q-spinner" style={{ marginTop: 20 }} />}
          </div>
        )}

        <div className="q-nav">
          {step < 4 ? (
            <>
              <button
                className="q-btn-back"
                onClick={() => {
                  if (step === 1) return;
                  if (step === 3) { setHasCar(null); setCanTransport(null); }
                  setStep((s) => (s - 1) as 1 | 2 | 3 | 4);
                }}
                disabled={step === 1}
              >
                ← Буцах
              </button>
              {step < 3 && (
                <button
                  className="q-btn-next"
                  onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3 | 4)}
                  disabled={step === 1 ? (!name.trim() || !registerId.trim()) : false}
                >
                  Үргэлжлүүлэх
                </button>
              )}
            </>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}
