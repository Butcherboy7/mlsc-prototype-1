
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
  Upload,
  Sparkles
} from 'lucide-react';

interface WelcomeDashboardProps {
  onSelectMode: (mode: string) => void;
}

const modes = [
  { 
    id: 'maths', 
    title: 'Maths Tutor', 
    icon: Calculator,
    description: 'Solve problems & learn concepts',
    color: 'from-blue-500 to-cyan-500',
    accent: 'bg-blue-100 text-blue-700'
  },
  { 
    id: 'coding', 
    title: 'Code Mentor', 
    icon: Code,
    description: 'Debug, learn & improve code',
    color: 'from-green-500 to-emerald-500',
    accent: 'bg-green-100 text-green-700'
  },
  { 
    id: 'business', 
    title: 'Business Coach', 
    icon: Briefcase,
    description: 'Strategy & startup guidance',
    color: 'from-purple-500 to-violet-500',
    accent: 'bg-purple-100 text-purple-700'
  },
  { 
    id: 'legal', 
    title: 'Legal Advisor', 
    icon: Scale,
    description: 'Legal concepts & analysis',
    color: 'from-red-500 to-pink-500',
    accent: 'bg-red-100 text-red-700'
  },
  { 
    id: 'literature', 
    title: 'Literature Guide', 
    icon: BookText,
    description: 'Writing & literary analysis',
    color: 'from-amber-500 to-orange-500',
    accent: 'bg-amber-100 text-amber-700'
  }
];

const WelcomeDashboard: React.FC<WelcomeDashboardProps> = ({ onSelectMode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl">
              <Brain className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Mentora
          </h1>
          <p className="text-2xl text-gray-600 font-light mb-4">
            Your AI Edu Buddy
          </p>
          <div className="flex items-center justify-center text-lg text-gray-500">
            <Sparkles className="w-5 h-5 mr-2" />
            Choose your AI mode to get started
          </div>
        </div>

        {/* AI Modes Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modes.map((mode, index) => {
              const Icon = mode.icon;
              return (
                <Card 
                  key={mode.id}
                  className="group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => onSelectMode(mode.id)}
                >
                  <CardContent className="p-8 text-center space-y-6 relative">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                      <div className={`w-full h-full bg-gradient-to-br ${mode.color} rounded-full transform translate-x-12 -translate-y-12`}></div>
                    </div>
                    
                    {/* Icon */}
                    <div className={`w-20 h-20 mx-auto rounded-3xl bg-gradient-to-r ${mode.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="font-bold text-xl text-gray-800 group-hover:text-gray-900 transition-colors">
                        {mode.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {mode.description}
                      </p>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${mode.accent}`}>
                        AI Powered
                      </div>
                    </div>

                    {/* Hover effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Additional Tools */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Study Tools & Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: 'pdf', title: 'PDF Summarizer', icon: Upload, desc: 'Smart document analysis' },
              { id: 'codelab', title: 'CodeLab', icon: Code, desc: 'Interactive coding' },
              { id: 'notes', title: 'Smart Notes', icon: FileText, desc: 'AI-generated notes' },
              { id: 'career', title: 'Career Test', icon: User, desc: 'Personality assessment' }
            ].map((tool, index) => {
              const Icon = tool.icon;
              return (
                <Card 
                  key={tool.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-200 bg-white/60 backdrop-blur-sm"
                  style={{ animationDelay: `${(index + 5) * 0.1}s` }}
                  onClick={() => onSelectMode(tool.id)}
                >
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="w-12 h-12 mx-auto bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">{tool.title}</h4>
                      <p className="text-sm text-gray-600">{tool.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeDashboard;
