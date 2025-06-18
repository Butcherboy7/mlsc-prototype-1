import React from 'react';
import { MessageCircle, FileText, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  dueCardsCount: number;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, dueCardsCount }) => {
  const tabs = [
    { id: 'chat', label: 'AI Chat', icon: MessageCircle },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'flashcards', label: 'Flashcards', icon: Brain, badge: dueCardsCount > 0 ? dueCardsCount : undefined }
  ];

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">Mentora</span>
          </div>

          {/* Navigation Tabs */}
          <div className="hidden md:flex items-center space-x-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  onClick={() => onTabChange(tab.id)}
                  className="relative"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                  {tab.badge && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      {tab.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Mobile placeholder - keep layout consistent */}
          <div className="w-8"></div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-3">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  onClick={() => onTabChange(tab.id)}
                  size="sm"
                  className="relative whitespace-nowrap"
                >
                  <Icon className="w-4 h-4" />
                  <span className="ml-1 text-xs">{tab.label}</span>
                  {tab.badge && (
                    <Badge variant="destructive" className="ml-1 text-xs">
                      {tab.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
