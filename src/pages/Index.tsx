
import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import BottomNavigation from '@/components/BottomNavigation';
import DesktopSidebar from '@/components/DesktopSidebar';
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

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  // Full screen components (dashboard and codelab)
  if (activeTab === 'dashboard' || activeTab === 'codelab') {
    return (
      <div className="min-h-screen bg-background">
        {renderActiveComponent()}
      </div>
    );
  }

  // Main app layout with sidebar/navigation
  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <DesktopSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        dueCardsCount={dueCardsCount}
        onBackToDashboard={handleBackToDashboard}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Desktop Top Navigation (hidden on mobile) */}
        <div className="hidden md:block">
          <Navigation 
            activeTab={activeTab}
            onTabChange={setActiveTab}
            dueCardsCount={dueCardsCount}
            isDarkMode={isDarkMode}
            onToggleDarkMode={handleToggleDarkMode}
            onBackToDashboard={handleBackToDashboard}
          />
        </div>

        {/* Content Area */}
        <main className="flex-1 p-4 pb-20 md:pb-4 overflow-auto">
          <div className="max-w-4xl mx-auto">
            {renderActiveComponent()}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dueCardsCount={dueCardsCount}
          onBackToDashboard={handleBackToDashboard}
        />
      </div>
    </div>
  );
};

export default Index;
