
import React from 'react';
import { Calculator, Code, Briefcase, Scale, BookText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StudyModeSelectorProps {
  selectedMode: string | null;
  onModeSelect: (mode: string) => void;
  onModeChange: (mode: string) => void;
}

const modes = [
  { 
    id: 'maths', 
    title: 'Maths Tutor', 
    icon: Calculator,
    description: 'Solve problems & learn concepts',
    color: 'from-blue-500 to-cyan-500'
  },
  { 
    id: 'coding', 
    title: 'Code Mentor', 
    icon: Code,
    description: 'Debug, learn & improve code',
    color: 'from-green-500 to-emerald-500'
  },
  { 
    id: 'business', 
    title: 'Business Coach', 
    icon: Briefcase,
    description: 'Strategy & startup guidance',
    color: 'from-purple-500 to-violet-500'
  },
  { 
    id: 'legal', 
    title: 'Legal Advisor', 
    icon: Scale,
    description: 'Legal concepts & analysis',
    color: 'from-red-500 to-pink-500'
  },
  { 
    id: 'literature', 
    title: 'Literature Guide', 
    icon: BookText,
    description: 'Writing & literary analysis',
    color: 'from-amber-500 to-orange-500'
  }
];

const StudyModeSelector: React.FC<StudyModeSelectorProps> = ({
  selectedMode,
  onModeSelect,
  onModeChange
}) => {
  if (selectedMode) {
    const currentMode = modes.find(mode => mode.id === selectedMode);
    if (!currentMode) return null;

    const Icon = currentMode.icon;
    
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${currentMode.color} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">{currentMode.title}</h3>
                <p className="text-sm text-muted-foreground">{currentMode.description}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onModeChange('')}
            >
              Change Mode
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Choose Your Study Mode</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modes.map((mode) => {
            const Icon = mode.icon;
            
            return (
              <Button
                key={mode.id}
                variant="ghost"
                className="h-auto p-4 flex flex-col items-center space-y-3 hover:bg-muted"
                onClick={() => onModeSelect(mode.id)}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${mode.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <div className="font-medium">{mode.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{mode.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudyModeSelector;
