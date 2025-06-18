
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StudyMode } from '@/types';
import { Calculator, Code, Briefcase, Scale, BookText } from 'lucide-react';

interface StudyModeSelectorProps {
  selectedMode: StudyMode;
  onModeChange: (mode: StudyMode) => void;
  className?: string;
}

const modes = [
  { id: 'maths' as StudyMode, label: 'Mathematics', icon: Calculator, color: 'from-blue-500 to-blue-700' },
  { id: 'coding' as StudyMode, label: 'Programming', icon: Code, color: 'from-green-500 to-green-700' },
  { id: 'business' as StudyMode, label: 'Business', icon: Briefcase, color: 'from-purple-500 to-purple-700' },
  { id: 'law' as StudyMode, label: 'Law', icon: Scale, color: 'from-red-500 to-red-700' },
  { id: 'literature' as StudyMode, label: 'Literature', icon: BookText, color: 'from-orange-500 to-orange-700' }
];

const StudyModeSelector: React.FC<StudyModeSelectorProps> = ({ selectedMode, onModeChange, className }) => {
  return (
    <Card className={`p-4 ${className}`}>
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Study Mode</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {modes.map(mode => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;
          
          return (
            <Button
              key={mode.id}
              variant={isSelected ? "default" : "outline"}
              onClick={() => onModeChange(mode.id)}
              className={`h-auto p-3 flex-col space-y-2 ${
                isSelected ? `bg-gradient-to-r ${mode.color} text-white border-0` : ''
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{mode.label}</span>
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

export default StudyModeSelector;
