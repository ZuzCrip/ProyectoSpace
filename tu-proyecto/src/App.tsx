import React, { useState } from 'react'
import WelcomeScreen from './components/WelcomeScreen'
import WelcomePageFormal from './components/WelcomePageFormal'
import SummaryPage from './components/SummaryPage'

interface UserData {
  email: string;
  userType: string;
  interests: string[];
  experience: string;
  name: string;
}

type AppScreen = 'welcome' | 'search' | 'summary';

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('welcome');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [summaryData, setSummaryData] = useState<{ title: string; source: string; summary: string } | null>(null);

  const handleWelcomeComplete = (data: UserData) => {
    setUserData(data);
    setCurrentScreen('search');
    console.log('Datos del usuario:', data);
  };

  const handleBackToWelcome = () => {
    setCurrentScreen('welcome');
  };

  const handleBackToSearch = () => {
    setCurrentScreen('search');
  };

  const handleShowSummary = (summaryData: { title: string; source: string; summary: string }) => {
    setSummaryData(summaryData);
    setCurrentScreen('summary');
  };

  const handleSearch = (query: string) => {
    console.log('Búsqueda realizada por', userData?.name, ':', query);
    console.log('Perfil del usuario:', userData?.userType);
    console.log('Intereses:', userData?.interests);
  };

  // Renderizar pantalla actual
  if (currentScreen === 'welcome') {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  if (currentScreen === 'summary' && summaryData) {
    return <SummaryPage summaryData={summaryData} onBack={handleBackToSearch} />;
  }

  return (
    <WelcomePageFormal 
      onSearch={handleSearch} 
      userData={userData!}
      onBack={handleBackToWelcome}
      onShowSummary={handleShowSummary}
    />
  );
}

export default App; 