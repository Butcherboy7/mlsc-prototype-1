
import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Notes from '@/components/Notes';
import Flashcards from '@/components/Flashcards';
import AIChat from '@/components/AIChat';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';

const Index = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
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

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'chat':
        return <AIChat />;
      case 'notes':
        return <Notes />;
      case 'flashcards':
        return <Flashcards />;
      default:
        return <AIChat />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        dueCardsCount={dueCardsCount}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderActiveComponent()}
      </main>
    </div>
  );
};

export default Index;
