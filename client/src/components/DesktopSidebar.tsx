
import React from 'react';
import { 
  MessageCircle, 
  FileText, 
  Brain, 
  User, 
  Upload, 
  Code,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DesktopSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  dueCardsCount: number;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  onTabChange,
  dueCardsCount
}) => {
  const sections = [
    {
      title: 'Main',
      items: [
        { id: 'chat', label: 'AI Chat', icon: MessageCircle },
      ]
    },
    {
      title: 'Study Tools',
      items: [
        { id: 'notes', label: 'Smart Notes', icon: FileText },
        { 
          id: 'flashcards', 
          label: 'Flashcards', 
          icon: Brain, 
          badge: dueCardsCount > 0 ? dueCardsCount : undefined 
        },
        { id: 'pdf', label: 'PDF Summarizer', icon: Upload },
        { id: 'codelab', label: 'CodeLab', icon: Code },
      ]
    },
    {
      title: 'Other',
      items: [
        { id: 'career', label: 'Career Test', icon: User },
      ]
    }
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">Mentora</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    className="w-full justify-start relative"
                    onClick={() => onTabChange(item.id)}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {item.label}
                    {item.badge && (
                      <Badge variant="destructive" className="ml-auto text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default DesktopSidebar;
