
import React, { useState } from 'react';
import { StudyMode, Flashcard, StudyPlan, ConfusionPoint } from '@/types';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import Notes from '@/components/Notes';
import Flashcards from '@/components/Flashcards';
import Doubts from '@/components/Doubts';
import StudyPlanner from '@/components/StudyPlanner';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMode, setSelectedMode] = useState<StudyMode>('maths');
  
  const { getDueCards, flashcards } = useSpacedRepetition();
  
  // Mock data for demonstration
  const [studyPlans] = useState<StudyPlan[]>([]);
  const [confusionPoints] = useState<ConfusionPoint[]>([]);

  const dueCardsCount = getDueCards().filter(card => card.mode === selectedMode).length;

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            selectedMode={selectedMode}
            onModeChange={setSelectedMode}
            flashcards={flashcards}
            studyPlans={studyPlans}
            confusionPoints={confusionPoints}
            onNavigate={setActiveTab}
          />
        );
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
      case 'doubts':
        return (
          <Doubts
            selectedMode={selectedMode}
            onModeChange={setSelectedMode}
          />
        );
      case 'planner':
        return (
          <StudyPlanner
            selectedMode={selectedMode}
            onModeChange={setSelectedMode}
          />
        );
      default:
        return (
          <Dashboard
            selectedMode={selectedMode}
            onModeChange={setSelectedMode}
            flashcards={flashcards}
            studyPlans={studyPlans}
            confusionPoints={confusionPoints}
            onNavigate={setActiveTab}
          />
        );
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
