
import React, { useState } from 'react';
import { 
  MessageCircle, 
  FileText, 
  Brain, 
  User, 
  Upload, 
  Code,
  Home,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const [isStudyToolsCollapsed, setIsStudyToolsCollapsed] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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
    <TooltipProvider>
      <aside className={`hidden md:flex flex-col bg-card border-r border-border h-screen sticky top-0 transition-all duration-300 ${isSidebarCollapsed ? 'w-16' : 'w-64'}`}>
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          {!isSidebarCollapsed ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">Mentora</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
              <Brain className="w-5 h-5 text-white" />
            </div>
          )}
          {!isSidebarCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarCollapsed(true)}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Expand Button (when collapsed) */}
        {isSidebarCollapsed && (
          <div className="p-2 border-b border-border">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarCollapsed(false)}
              className="h-8 w-8 mx-auto"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Navigation */}
        <nav className={`flex-1 space-y-4 overflow-y-auto ${isSidebarCollapsed ? 'p-2' : 'p-4'}`}>
          {sections.map((section) => {
            const isStudyTools = section.title === 'Study Tools';
            const isSectionCollapsed = isStudyTools && isStudyToolsCollapsed && !isSidebarCollapsed;
            
            return (
              <div key={section.title} className={`space-y-2 ${!isSidebarCollapsed && 'border border-border/50 rounded-lg p-3 bg-card/50'}`}>
                {!isSidebarCollapsed && (
                  <button
                    onClick={() => isStudyTools && setIsStudyToolsCollapsed(!isStudyToolsCollapsed)}
                    className={`w-full flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wide ${isStudyTools ? 'cursor-pointer hover:text-foreground transition-colors' : 'cursor-default'}`}
                  >
                    <span>{section.title}</span>
                    {isStudyTools && (
                      isSectionCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                )}
                {!isSectionCollapsed && (
                  <div className={`space-y-1 ${!isSidebarCollapsed && 'pt-1'}`}>
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      
                      if (isSidebarCollapsed) {
                        return (
                          <Tooltip key={item.id} delayDuration={0}>
                            <TooltipTrigger asChild>
                              <Button
                                variant={isActive ? "default" : "ghost"}
                                size="icon"
                                className="w-full h-10 relative"
                                onClick={() => onTabChange(item.id)}
                              >
                                <Icon className="w-5 h-5" />
                                {item.badge && (
                                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center text-[10px] text-white">
                                    {item.badge}
                                  </span>
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p>{item.label}</p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      }
                      
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
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </TooltipProvider>
  );
};

export default DesktopSidebar;
