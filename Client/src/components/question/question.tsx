import './question.css';
import { useState } from 'react';
import { useProfile } from '../../hooks/useProfile';
import type { ProfileType } from '../../types/profile';

interface QuestionDef {
  id: string;
  category: string;
  question: string;
  options: { label: string; value: string }[];
}

const QUESTIONS: QuestionDef[] = [

  {
    id: 'assistive_device',
    category: 'Тусламжийн хэрэгсэл',
    question: 'Та ямар тусламжийн хэрэгсэл ашигладаг вэ?',
    options: [
      { label: 'Гар тэргэнцэр', value: 'manual_wheelchair' },
      { label: 'Цахилгаан тэргэнцэр', value: 'electric_wheelchair' },
      { label: 'Таяг / Бариул', value: 'cane' },
      { label: 'Алхагч', value: 'walker' },
      { label: 'Харааны таяг', value: 'white_cane' },
      { label: 'Ашигладаггүй', value: 'none' },
    ],
  },
  {
    id: 'age_range',
    category: 'Нас',
    question: 'Таны нас хэд вэ?',
    options: [
      { label: '15-аас доош', value: 'under_15' },
      { label: '15 — 21', value: '15-21' },
      { label: '22 — 36', value: '22-36' },
      { label: '37 — 54', value: '37-54' },
      { label: '55 — 70', value: '55-70' },
      { label: '71+', value: '71+' },
    ],
  },
  {
    id: 'main_challenge',
    category: 'Гудамжны бэрхшээл',
    question: 'Гудамжинд явахад таны хамгийн том бэрхшээл юу вэ?',
    options: [
      { label: 'Мөстсөн зам', value: 'ice' },
      { label: 'Эвдэрсэн зам', value: 'broken' },
      { label: 'Налуу / шат', value: 'slope' },
      { label: 'Хаалттай зам', value: 'blocked' },
      { label: 'Замын хөдөлгөөн', value: 'traffic' },
    ],
  },
  {
    id: 'travel_companion',
    category: 'Хамтрагч',
    question: 'Та ихэвчлэн хэнтэй хамт явдаг вэ?',
    options: [
      { label: 'Ганцаараа', value: 'alone' },
      { label: 'Гэр бүлийн хүнтэй', value: 'family' },
      { label: 'Асран хамгаалагчтай', value: 'caregiver' },
      { label: 'Найзтайгаа', value: 'friend' },
    ],
  },
];

export default function Questions({ onBack }: { onBack?: () => void }) {
  const { completeSurvey } = useProfile();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const splashProfile = localStorage.getItem('accessub-splash');
    const init: Record<string, string> = {};
    if (splashProfile) init.profile_type = splashProfile;
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slideDir, setSlideDir] = useState<'forward' | 'back' | null>(null);

  const goTo = (next: number, dir: 'forward' | 'back') => {
    setSlideDir(dir);
    setTimeout(() => { setCurrent(next); setSlideDir(null); }, 280);
  };

  const handleSelect = (value: string) =>
    setAnswers((prev) => ({ ...prev, [QUESTIONS[current].id]: value }));

  const handleNext = () =>
    current < QUESTIONS.length - 1 ? goTo(current + 1, 'forward') : handleSubmit();

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      await completeSurvey(answers, answers.profile_type as ProfileType);
    } catch {
      setError('Алдаа гарлаа. Дахин оролдоно уу.');
      setSaving(false);
    }
  };

  const q = QUESTIONS[current];
  const currentAnswer = answers[q.id] ?? '';
  const isLast = current === QUESTIONS.length - 1;

  return (
    <div className="q-page">
      <div className="q-blob q-blob-1" />
      <div className="q-blob q-blob-2" />

      <div className="q-shell">
        <div className="q-header">
          <span className="q-brand">GERZAM</span>
          <span className="q-step-badge">{current + 1} / {QUESTIONS.length}</span>
        </div>

        <div className="q-progress-track">
          <div className="q-progress-fill" style={{ width: `${((current + 1) / QUESTIONS.length) * 100}%` }} />
        </div>

        <div className={`q-card ${slideDir ? (slideDir === 'forward' ? 'q-slide-out-left' : 'q-slide-out-right') : 'q-slide-in'}`}>
          <div className="q-category-tag">{q.category}</div>
          <h2 className="q-question">{q.question}</h2>

          <div className={`q-options ${q.options.length > 4 ? 'q-options-grid' : 'q-options-col'}`}>
            {q.options.map((opt) => (
              <button
                key={opt.value}
                className={`q-option ${currentAnswer === opt.value ? 'q-option-selected' : ''}`}
                onClick={() => handleSelect(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {error && <p className="q-error">{error}</p>}
        </div>

        <div className="q-nav">
          <button
            className="q-btn-back"
            onClick={() => current === 0 ? onBack?.() : goTo(current - 1, 'back')}
            disabled={current === 0 && !onBack}
          >
            ← Буцах
          </button>
          <button className="q-btn-next" onClick={handleNext} disabled={!currentAnswer || saving}>
            {saving ? <span className="q-btn-spinner" /> : isLast ? 'Дуусгах →' : 'Дараах →'}
          </button>
        </div>
      </div>
    </div>
  );
}
