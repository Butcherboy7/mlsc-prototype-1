import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calculator, 
  Code, 
  Briefcase, 
  Scale, 
  BookText,
  FileText,
  Brain,
  User,
  Terminal
} from 'lucide-react';

interface WelcomeDashboardProps {
  onSelectMode: (mode: string) => void;
}

const studyModes = [
  { 
    id: 'maths', 
    title: 'Maths Tutor', 
    description: 'Get help with mathematics, from basic arithmetic to advanced calculus',
    icon: Calculator,
    color: 'from-blue-500 to-cyan-500'
  },
  { 
    id: 'coding', 
    title: 'Code Mentor', 
    description: 'Programming guidance, debugging help, and best practices',
    icon: Code,
    color: 'from-green-500 to-emerald-500'
  },
  { 
    id: 'business', 
    title: 'Business Coach', 
    description: 'Startup advice, business strategy, and entrepreneurship guidance',
    icon: Briefcase,
    color: 'from-purple-500 to-violet-500'
  },
  { 
    id: 'legal', 
    title: 'Legal Advisor', 
    description: 'Legal concepts, constitutional law, and case study analysis',
    icon: Scale,
    color: 'from-red-500 to-pink-500'
  },
  { 
    id: 'literature', 
    title: 'Literature Guide', 
    description: 'Literary analysis, creative writing, and critical thinking',
    icon: BookText,
    color: 'from-yellow-500 to-orange-500'
  },
  { 
    id: 'codelab', 
    title: 'CodeLab', 
    description: 'Interactive coding playground with AI assistance',
    icon: Terminal,
    color: 'from-indigo-500 to-purple-500'
  }
];

const otherFeatures = [
  { id: 'pdf', title: 'PDF Summarizer', icon: FileText, description: 'Upload and summarize any PDF document' },
  { id: 'notes', title: 'Smart Notes', icon: FileText, description: 'Create and generate AI-powered notes' },
  { id: 'flashcards', title: 'Flashcards', icon: Brain, description: 'Spaced repetition learning system' },
  { id: 'career', title: 'Career Guide', icon: User, description: 'MBTI personality test and career recommendations' }
];

const WelcomeDashboard: React.FC<WelcomeDashboardProps> = ({ onSelectMode }) => {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to Mentora 👋
        </h1>
        <p className="text-xl text-muted-foreground">
          Choose your AI Companion to begin your learning journey
        </p>
      </div>

      {/* AI Study Modes */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-center">AI Study Companions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studyModes.map(mode => {
            const Icon = mode.icon;
            return (
              <Card 
                key={mode.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-primary/50"
                onClick={() => onSelectMode(mode.id)}
              >
                <CardHeader className="text-center pb-2">
                  <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${mode.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg">{mode.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground">{mode.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Other Features */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-center">Learning Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {otherFeatures.map(feature => {
            const Icon = feature.icon;
            return (
              <Card 
                key={feature.id} 
                className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
                onClick={() => onSelectMode(feature.id)}
              >
                <CardHeader className="text-center pb-2">
                  <div className="w-12 h-12 mx-auto rounded-lg bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center mb-2">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
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
