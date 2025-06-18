
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { StudyMode, StudyPlan, StudyTopic } from '@/types';
import { Calendar, Clock, Target, CheckCircle, Plus, Sparkles } from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import StudyModeSelector from './StudyModeSelector';

interface StudyPlannerProps {
  selectedMode: StudyMode;
  onModeChange: (mode: StudyMode) => void;
}

const StudyPlanner: React.FC<StudyPlannerProps> = ({ selectedMode, onModeChange }) => {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlan, setNewPlan] = useState({
    title: '',
    description: '',
    duration: 30,
    topics: [] as string[]
  });

  const { isLoading, generateStudyPlan } = useAI();

  const handleGeneratePlan = async () => {
    if (!newPlan.title) return;

    try {
      const response = await generateStudyPlan(newPlan.title, newPlan.duration, selectedMode);
      
      // Parse the AI response to extract topics (mock implementation)
      const topics = extractTopicsFromAI(response.content, newPlan.duration);
      
      const plan: StudyPlan = {
        id: crypto.randomUUID(),
        title: newPlan.title,
        description: newPlan.description || response.content.split('\n')[0],
        mode: selectedMode,
        totalDays: newPlan.duration,
        currentDay: 0,
        topics,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setPlans(prev => [...prev, plan]);
      setNewPlan({ title: '', description: '', duration: 30, topics: [] });
      setIsCreating(false);
    } catch (error) {
      console.error('Error generating study plan:', error);
    }
  };

  const updateTopicProgress = (planId: string, topicId: string) => {
    setPlans(prev => prev.map(plan => {
      if (plan.id === planId) {
        const updatedTopics = plan.topics.map(topic => 
          topic.id === topicId ? { ...topic, completed: !topic.completed } : topic
        );
        
        const completedDays = new Set(updatedTopics.filter(t => t.completed).map(t => t.day)).size;
        
        return {
          ...plan,
          topics: updatedTopics,
          currentDay: completedDays,
          updatedAt: new Date()
        };
      }
      return plan;
    }));
  };

  const modePlans = plans.filter(plan => plan.mode === selectedMode);
  const activePlan = modePlans.find(plan => plan.currentDay < plan.totalDays);

  return (
    <div className="space-y-6">
      <StudyModeSelector selectedMode={selectedMode} onModeChange={onModeChange} />

      {/* Create New Plan */}
      {isCreating && (
        <Card className="mentora-card">
          <CardHeader>
            <CardTitle>Create Study Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Plan title (e.g., 'Linear Algebra Fundamentals')"
              value={newPlan.title}
              onChange={(e) => setNewPlan(prev => ({ ...prev, title: e.target.value }))}
            />
            
            <Textarea
              placeholder="Description (optional)"
              value={newPlan.description}
              onChange={(e) => setNewPlan(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
            
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Duration:</label>
              <Input
                type="number"
                min="1"
                max="365"
                value={newPlan.duration}
                onChange={(e) => setNewPlan(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">days</span>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleGeneratePlan} disabled={isLoading || !newPlan.title}>
                <Sparkles className="w-4 h-4 mr-2" />
                {isLoading ? 'Generating...' : 'Generate with AI'}
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {!isCreating && (
        <div className="flex gap-4">
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Study Plan
          </Button>
        </div>
      )}

      {/* Active Plan */}
      {activePlan && (
        <Card className="mentora-card border-mentora-200 bg-mentora-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-mentora-800">{activePlan.title}</CardTitle>
              <Badge variant="outline" className="text-mentora-600 border-mentora-400">
                Active Plan
              </Badge>
            </div>
            <p className="text-sm text-mentora-700">{activePlan.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{activePlan.currentDay} of {activePlan.totalDays} days</span>
            </div>
            <Progress value={(activePlan.currentDay / activePlan.totalDays) * 100} className="w-full" />
            
            <div className="space-y-2">
              <h4 className="font-medium">Today's Topics:</h4>
              {activePlan.topics
                .filter(topic => topic.day === activePlan.currentDay + 1)
                .map(topic => (
                  <div key={topic.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateTopicProgress(activePlan.id, topic.id)}
                        className={topic.completed ? 'text-green-600' : ''}
                      >
                        <CheckCircle className={`w-4 h-4 ${topic.completed ? 'fill-current' : ''}`} />
                      </Button>
                      <div>
                        <p className={`font-medium ${topic.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {topic.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{topic.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      {topic.estimatedHours}h
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Plans */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Your Study Plans</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modePlans.map(plan => {
            const completedTopics = plan.topics.filter(t => t.completed).length;
            const totalTopics = plan.topics.length;
            const progressPercent = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;
            
            return (
              <Card key={plan.id} className="mentora-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{plan.title}</CardTitle>
                    <Badge variant="outline">
                      {plan.currentDay >= plan.totalDays ? 'Completed' : 'In Progress'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Topics Progress</span>
                    <span>{completedTopics} of {totalTopics}</span>
                  </div>
                  <Progress value={progressPercent} className="w-full" />
                  
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="font-medium text-mentora-600">{plan.totalDays}</div>
                      <div className="text-muted-foreground">Days</div>
                    </div>
                    <div>
                      <div className="font-medium text-orange-600">{plan.currentDay}</div>
                      <div className="text-muted-foreground">Completed</div>
                    </div>
                    <div>
                      <div className="font-medium text-green-600">
                        {Math.round(plan.topics.reduce((acc, topic) => acc + topic.estimatedHours, 0))}h
                      </div>
                      <div className="text-muted-foreground">Total Time</div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => console.log('View plan details:', plan.id)}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {modePlans.length === 0 && !isCreating && (
        <Card className="mentora-card">
          <CardContent className="text-center py-8">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No study plans yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first AI-generated study plan for {selectedMode}
            </p>
            <Button onClick={() => setIsCreating(true)}>
              Create Study Plan
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Helper function to extract topics from AI response
function extractTopicsFromAI(content: string, duration: number): StudyTopic[] {
  // Mock implementation - in a real app, this would parse the AI response more intelligently
  const baseTopics = [
    'Fundamentals and Basic Concepts',
    'Core Principles and Theory',
    'Practical Applications',
    'Advanced Techniques',
    'Problem Solving',
    'Real-world Examples',
    'Review and Practice',
    'Assessment and Testing'
  ];

  const topicsPerDay = Math.ceil(baseTopics.length / duration);
  const topics: StudyTopic[] = [];

  baseTopics.forEach((topic, index) => {
    const day = Math.floor(index / topicsPerDay) + 1;
    topics.push({
      id: crypto.randomUUID(),
      name: topic,
      description: `Study ${topic.toLowerCase()} with exercises and examples`,
      estimatedHours: 2 + Math.floor(Math.random() * 3),
      completed: false,
      day: Math.min(day, duration)
    });
  });

  return topics;
}

export default StudyPlanner;
