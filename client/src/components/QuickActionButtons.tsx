import React from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Baby, Lightbulb, Play, Eye, HelpCircle } from 'lucide-react';

interface QuickActionButtonsProps {
  onAction: (action: string, prompt: string) => void;
  disabled?: boolean;
  currentMessage?: string;
}

const QuickActionButtons: React.FC<QuickActionButtonsProps> = ({ 
  onAction, 
  disabled = false,
  currentMessage = ""
}) => {
  const actions = [
    {
      icon: Baby,
      label: '🧒 Explain Like I\'m 5',
      action: 'eli5',
      prompt: `Please explain the previous response in very simple terms that a 5-year-old would understand. Use simple words, basic examples, and make it fun and easy to grasp.`
    },
    {
      icon: Lightbulb,
      label: '🧬 Give Real-Life Analogy',
      action: 'analogy',
      prompt: `Please provide real-world analogies and examples to explain the concepts from the previous response. Use everyday situations and familiar objects to make the ideas clear and relatable.`
    }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {actions.map((action) => (
        <Button
          key={action.action}
          variant="outline"
          size="sm"
          onClick={() => onAction(action.action, action.prompt)}
          disabled={disabled || !currentMessage.trim()}
          className="h-8 px-3 text-xs transition-all duration-200 hover:scale-105 hover:shadow-md"
        >
          <action.icon className="w-3 h-3 mr-1" />
          {action.label}
        </Button>
      ))}
    </div>
  );
};

export default QuickActionButtons;