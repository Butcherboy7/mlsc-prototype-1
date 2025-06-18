
import React, { useState } from 'react';
import { StudyMode } from '@/types';
import Navigation from '@/components/Navigation';
import Notes from '@/components/Notes';
import Flashcards from '@/components/Flashcards';
import AIChat from '@/components/AIChat';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';

const Index = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedMode, setSelectedMode] = useState<StudyMode>('maths');
  
  const { getDueCards } = useSpacedRepetition();
  const dueCardsCount = getDueCards().filter(card => card.mode === selectedMode).length;

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'chat':
        return <AIChat />;
      case 'notes':
        return (
          <Notes
            selectedMode={selectedMode}
            onModeChange={setSelectedMode}
          />
        );
      case 'flashcards':
        return (
          <Flashcards
            selectedMode={selectedMode}
            onModeChange={setSelectedMode}
          />
        );
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
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderActiveComponent()}
      </main>
    </div>
  );
};

export default Index;
