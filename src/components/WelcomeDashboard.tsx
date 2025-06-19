
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Calculator, 
  Code, 
  Briefcase, 
  Scale, 
  BookText,
  FileText,
  Brain,
  User,
  Terminal,
  Upload
} from 'lucide-react';

interface WelcomeDashboardProps {
  onSelectMode: (mode: string) => void;
}

const modes = [
  { 
    id: 'maths', 
    title: 'Maths Tutor', 
    icon: Calculator,
    description: 'Get help with mathematics problems',
    color: 'from-blue-500 to-cyan-500'
  },
  { 
    id: 'coding', 
    title: 'Code Mentor', 
    icon: Code,
    description: 'Programming guidance and debugging',
    color: 'from-green-500 to-emerald-500'
  },
  { 
    id: 'business', 
    title: 'Business Coach', 
    icon: Briefcase,
    description: 'Startup and business strategy',
    color: 'from-purple-500 to-violet-500'
  },
  { 
    id: 'legal', 
    title: 'Legal Advisor', 
    icon: Scale,
    description: 'Legal concepts and case analysis',
    color: 'from-red-500 to-pink-500'
  },
  { 
    id: 'literature', 
    title: 'Literature Guide', 
    icon: BookText,
    description: 'Literary analysis and writing',
    color: 'from-amber-500 to-orange-500'
  },
  { 
    id: 'pdf', 
    title: 'PDF Summarizer', 
    icon: Upload,
    description: 'Summarize any PDF document',
    color: 'from-indigo-500 to-purple-500'
  },
  { 
    id: 'codelab', 
    title: 'CodeLab', 
    icon: Terminal,
    description: 'Interactive coding playground',
    color: 'from-slate-500 to-gray-600'
  },
  { 
    id: 'notes', 
    title: 'Notes', 
    icon: FileText,
    description: 'Create and manage study notes',
    color: 'from-teal-500 to-cyan-500'
  },
  { 
    id: 'flashcards', 
    title: 'Flashcards', 
    icon: Brain,
    description: 'Spaced repetition learning',
    color: 'from-rose-500 to-pink-500'
  },
  { 
    id: 'career', 
    title: 'Career Test', 
    icon: User,
    description: 'MBTI personality assessment',
    color: 'from-emerald-500 to-green-500'
  }
];

const WelcomeDashboard: React.FC<WelcomeDashboardProps> = ({ onSelectMode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
            Welcome to Mentora
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Choose Your AI Mode
          </p>
        </div>

        {/* Grid of modes */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {modes.map(mode => {
            const Icon = mode.icon;
            return (
              <Card 
                key={mode.id} 
                className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-lg group"
                onClick={() => onSelectMode(mode.id)}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${mode.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-800 text-sm">
                      {mode.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-tight">
                      {mode.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WelcomeDashboard;
