
import React, { useState } from 'react'
import WelcomeScreen from './components/WelcomeScreen'
import WelcomePageES from './components/WelcomePageES'

interface UserData {
  email: string;
  userType: string;
  interests: string[];
  experience: string;
  name: string;
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'search'>('welcome');
  const [userData, setUserData] = useState<UserData | null>(null);

  const handleWelcomeComplete = (data: UserData) => {
    setUserData(data);
    setCurrentScreen('search');
    console.log('Datos del usuario:', data);
  };

  const handleBackToWelcome = () => {
    setCurrentScreen('welcome');
  };

  const handleSearch = (query: string) => {
    console.log('Búsqueda realizada por', userData?.name, ':', query);
    console.log('Perfil del usuario:', userData?.userType);
    console.log('Intereses:', userData?.interests);
    // Aquí puedes implementar la lógica de búsqueda
    // Por ejemplo, filtrar resultados basados en el perfil del usuario
  };

  if (currentScreen === 'welcome') {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  return (
    <WelcomePageES 
      onSearch={handleSearch} 
      userData={userData!}
      onBack={handleBackToWelcome}
    />
  );
}

export default App
