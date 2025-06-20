
import React from 'react';
import { Home, MessageCircle, FileText, Brain, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  dueCardsCount: number;
  onBackToDashboard: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  dueCardsCount,
  onBackToDashboard
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: Home, action: onBackToDashboard },
    { id: 'chat', label: 'AI Chat', icon: MessageCircle },
    { id: 'notes', label: 'Notes', icon: FileText },
    { 
      id: 'flashcards', 
      label: 'Cards', 
      icon: Brain, 
      badge: dueCardsCount > 0 ? dueCardsCount : undefined 
    },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center justify-center h-16 px-3 relative ${
                isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground'
              }`}
              onClick={() => tab.action ? tab.action() : onTabChange(tab.id)}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
              {tab.badge && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center"
                >
                  {tab.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
