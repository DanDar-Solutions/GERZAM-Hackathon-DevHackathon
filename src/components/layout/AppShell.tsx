import { useState, useEffect } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { useVolunteer } from '../../contexts/VolunteerContext';
import Questions from '../question/question';
import { SplashScreen } from '../splash/SplashScreen';
import { HazardMap } from '../map/HazardMap';
import './AppShell.css';

export function AppShell() {
  const { user, profile, loading, loginAsGuest } = useProfile();
  const { volunteer } = useVolunteer();

  const [splashDone, setSplashDone] = useState(
    () => !!localStorage.getItem('accessub-splash') || !!localStorage.getItem('accessub-volunteer'),
  );

  useEffect(() => {
    document.documentElement.classList.toggle('visual-mode', profile === 'visual');
    return () => document.documentElement.classList.remove('visual-mode');
  }, [profile]);

  // All hooks must run before any conditional returns
  useEffect(() => {
    if (volunteer) return; // Volunteers skip guest login
    if (splashDone && !user && !loading) loginAsGuest();
  }, [volunteer, splashDone, user, loading, loginAsGuest]);

  // Volunteers go straight to the map — no survey or profile selection needed.
  // Require splashDone so that a fresh registration shows the thank-you screen
  // for 2 s before onDone fires and sets splashDone=true.
  if (volunteer && splashDone) {
    return (
      <div className="app-shell">
        <HazardMap />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!splashDone) return <SplashScreen onDone={() => setSplashDone(true)} />;
  if (!user) return <div className="app-loading"><div className="spinner" /></div>;
  if (!user.surveyCompleted || !profile) return <Questions />;

  return (
    <div className="app-shell">
      <HazardMap />
    </div>
  );
}
