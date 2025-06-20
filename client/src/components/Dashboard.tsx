
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { StudyMode, Flashcard, StudyPlan, ConfusionPoint } from '@/types';
import { Brain, FileText, Target, TrendingUp, Clock, Zap } from 'lucide-react';
import StudyModeSelector from './StudyModeSelector';

interface DashboardProps {
  selectedMode: StudyMode;
  onModeChange: (mode: StudyMode) => void;
  flashcards: Flashcard[];
  studyPlans: StudyPlan[];
  confusionPoints: ConfusionPoint[];
  onNavigate: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  selectedMode,
  onModeChange,
  flashcards,
  studyPlans,
  confusionPoints,
  onNavigate
}) => {
  const dueCards = flashcards.filter(card => card.nextReview <= new Date()).length;
  const totalCards = flashcards.filter(card => card.mode === selectedMode).length;
  const currentPlan = studyPlans.find(plan => plan.mode === selectedMode && plan.currentDay < plan.totalDays);
  const todayConfusion = confusionPoints.filter(point => 
    new Date(point.timestamp).toDateString() === new Date().toDateString()
  );

  const progressPercent = currentPlan ? (currentPlan.currentDay / currentPlan.totalDays) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Study Mode Selector */}
      <StudyModeSelector 
        selectedMode={selectedMode} 
        onModeChange={onModeChange}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="mentora-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Cards</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-mentora-600">{dueCards}</div>
            <p className="text-xs text-muted-foreground">
              {totalCards} total in {selectedMode}
            </p>
          </CardContent>
        </Card>

        <Card className="mentora-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">7</div>
            <p className="text-xs text-muted-foreground">days in a row</p>
          </CardContent>
        </Card>

        <Card className="mentora-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">2.5h</div>
            <p className="text-xs text-muted-foreground">today</p>
          </CardContent>
        </Card>

        <Card className="mentora-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">87%</div>
            <p className="text-xs text-muted-foreground">this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Study Plan */}
      {currentPlan && (
        <Card className="mentora-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Current Study Plan: {currentPlan.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{currentPlan.currentDay} of {currentPlan.totalDays} days</span>
            </div>
            <Progress value={progressPercent} className="w-full" />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => onNavigate('planner')}>
                View Plan
              </Button>
              <Button size="sm" variant="outline">
                Continue Studying
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="mentora-card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('notes')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5" />
              Create Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Generate AI-powered notes from PDFs or topics
            </p>
          </CardContent>
        </Card>

        <Card className="mentora-card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('flashcards')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="w-5 h-5" />
              Study Flashcards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Review {dueCards} due cards with spaced repetition
            </p>
          </CardContent>
        </Card>

        <Card className="mentora-card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('doubts')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="w-5 h-5" />
              Ask Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Get instant AI explanations for difficult concepts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Confusion Detector */}
      {todayConfusion.length > 0 && (
        <Card className="mentora-card border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Confusion Detected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayConfusion.map((point, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-yellow-700">{point.topic}</span>
                  <Badge variant="outline" className="text-yellow-600 border-yellow-400">
                    {Math.round(point.confidence * 100)}% confidence
                  </Badge>
                </div>
              ))}
            </div>
            <Button size="sm" className="mt-3" onClick={() => onNavigate('doubts')}>
              Get Help
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
