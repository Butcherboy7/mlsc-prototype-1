
import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Notes from '@/components/Notes';
import Flashcards from '@/components/Flashcards';
import AIChat from '@/components/AIChat';
import CareerGuide from '@/components/CareerGuide';
import WelcomeDashboard from '@/components/WelcomeDashboard';
import PDFSummarizer from '@/components/PDFSummarizer';
import CodeLab from '@/components/CodeLab';
import LoadingScreen from '@/components/LoadingScreen';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { getDueCards } = useSpacedRepetition();
  const dueCardsCount = getDueCards().length;

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSelectMode = (mode: string) => {
    if (['maths', 'coding', 'business', 'legal', 'literature'].includes(mode)) {
      setSelectedMode(mode);
      setActiveTab('chat');
    } else {
      setActiveTab(mode);
      setSelectedMode(null);
    }
  };

  const handleBackToDashboard = () => {
    setActiveTab('dashboard');
    setSelectedMode(null);
  };

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <WelcomeDashboard onSelectMode={handleSelectMode} />;
      case 'chat':
        return <AIChat selectedMode={selectedMode} onBack={handleBackToDashboard} />;
      case 'notes':
        return <Notes onBack={handleBackToDashboard} />;
      case 'flashcards':
        return <Flashcards onBack={handleBackToDashboard} />;
      case 'career':
        return <CareerGuide onBack={handleBackToDashboard} />;
      case 'pdf':
        return <PDFSummarizer onBack={handleBackToDashboard} />;
      case 'codelab':
        return <CodeLab onBack={handleBackToDashboard} />;
      default:
        return <WelcomeDashboard onSelectMode={handleSelectMode} />;
    }
  };

  const showNavigation = activeTab !== 'dashboard' && activeTab !== 'codelab';

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {showNavigation && (
        <Navigation 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dueCardsCount={dueCardsCount}
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
          onBackToDashboard={handleBackToDashboard}
        />
      )}
      
      <main className={`${showNavigation ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6' : ''}`}>
        {renderActiveComponent()}
      </main>
    </div>
  );
};

export default Index;
