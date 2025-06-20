
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
  const [showDashboard, setShowDashboard] = useState(true);
  
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
    setShowDashboard(false);
    if (['maths', 'coding', 'business', 'legal', 'literature'].includes(mode)) {
      setSelectedMode(mode);
      setActiveTab('chat');
    } else {
      setActiveTab(mode);
      setSelectedMode(null);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedMode(null);
  };

  const handleBackToMain = () => {
    setActiveTab('chat');
    setSelectedMode(null);
  };

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  const renderActiveComponent = () => {
    if (showDashboard && activeTab === 'dashboard') {
      return <WelcomeDashboard onSelectMode={handleSelectMode} />;
    }

    switch (activeTab) {
      case 'chat':
        return <AIChat selectedMode={selectedMode} />;
      case 'notes':
        return <Notes onBack={handleBackToMain} />;
      case 'flashcards':
        return <Flashcards onBack={handleBackToMain} />;
      case 'career':
        return <CareerGuide onBack={handleBackToMain} />;
      case 'pdf':
        return <PDFSummarizer onBack={handleBackToMain} />;
      case 'codelab':
        return <CodeLab onBack={handleBackToMain} />;
      default:
        return <AIChat selectedMode={selectedMode} />;
    }
  };

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  // Show dashboard only once at startup
  if (showDashboard && activeTab === 'dashboard') {
    return (
      <div className="min-h-screen bg-background">
        {renderActiveComponent()}
      </div>
    );
  }

  // Full screen components (codelab)
  if (activeTab === 'codelab') {
    return (
      <div className="min-h-screen bg-background">
        {renderActiveComponent()}
      </div>
    );
  }

  // Main app layout with sidebar/navigation
  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Desktop Sidebar */}
      <DesktopSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        dueCardsCount={dueCardsCount}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Desktop Top Navigation (hidden on mobile) */}
        <div className="hidden md:block">
          <Navigation 
            activeTab={activeTab}
            onTabChange={handleTabChange}
            dueCardsCount={dueCardsCount}
            isDarkMode={isDarkMode}
            onToggleDarkMode={handleToggleDarkMode}
            onBackToDashboard={handleBackToMain}
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
          onTabChange={handleTabChange}
          dueCardsCount={dueCardsCount}
        />
      </div>
    </div>
  );
};

export default Index;
