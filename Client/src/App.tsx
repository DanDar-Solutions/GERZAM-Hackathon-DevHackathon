import { ProfileProvider } from './contexts/ProfileContext';
import { VolunteerProvider } from './contexts/VolunteerContext';
import { AppShell } from './components/layout/AppShell';

function App() {
  return (
    <VolunteerProvider>
      <ProfileProvider>
        <AppShell />
      </ProfileProvider>
    </VolunteerProvider>
  );
}

export default App;
