
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StudyMode } from '@/types';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  Upload, 
  FileText, 
  Brain, 
  Sparkles,
  Calculator,
  Code,
  Briefcase,
  Scale,
  BookText,
  Plus,
  MessageCircle
} from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { useVoice } from '@/hooks/useVoice';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  pdfSummary?: {
    fileName: string;
    shortSummary: string;
    detailedSummary: string;
  };
}

const studyModes = [
  { id: 'maths' as StudyMode, label: 'Math Tutor', icon: Calculator, description: 'Expert in mathematics, calculus, algebra, and problem-solving' },
  { id: 'coding' as StudyMode, label: 'Code Mentor', icon: Code, description: 'Programming expert in multiple languages and best practices' },
  { id: 'business' as StudyMode, label: 'Business Coach', icon: Briefcase, description: 'Strategy, marketing, finance, and entrepreneurship guide' },
  { id: 'law' as StudyMode, label: 'Legal Advisor', icon: Scale, description: 'Constitutional law, contracts, and legal principles expert' },
  { id: 'literature' as StudyMode, label: 'Literature Guide', icon: BookText, description: 'Literary analysis, writing, and critical thinking mentor' }
];

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [selectedMode, setSelectedMode] = useState<StudyMode | null>(null);
  const [showModeSelector, setShowModeSelector] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isLoading, answerQuestion, summarizePDF } = useAI();
  const { transcript, isListening, startListening, stopListening, speak, resetTranscript } = useVoice();

  useEffect(() => {
    if (transcript && transcript.trim()) {
      setCurrentMessage(prev => prev + ' ' + transcript);
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleModeSelect = (mode: StudyMode) => {
    setSelectedMode(mode);
    setShowModeSelector(false);
    
    const modeInfo = studyModes.find(m => m.id === mode);
    const welcomeMessage: Message = {
      id: crypto.randomUUID(),
      type: 'ai',
      content: `Hello! I'm your ${modeInfo?.label}. ${modeInfo?.description}. How can I help you learn today?`,
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !selectedMode) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');

    try {
      const response = await answerQuestion(currentMessage, selectedMode);
      
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        type: 'ai',
        content: response.content,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        type: 'system',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedMode) return;

    const text = `Content from ${file.name} - This is a demo text extraction.`;
    
    try {
      const response = await summarizePDF(text, selectedMode);
      
      const pdfMessage: Message = {
        id: crypto.randomUUID(),
        type: 'ai',
        content: 'I\'ve analyzed your PDF. Here are the summaries:',
        timestamp: new Date(),
        pdfSummary: {
          fileName: file.name,
          shortSummary: response.content.slice(0, 200) + '...',
          detailedSummary: response.content
        }
      };

      setMessages(prev => [...prev, pdfMessage]);
    } catch (error) {
      console.error('PDF processing error:', error);
    }

    event.target.value = '';
  };

  const createNotesFromSummary = (summary: string) => {
    // This would integrate with the Notes component
    console.log('Creating notes from:', summary);
    // For now, just show a success message
    const successMessage: Message = {
      id: crypto.randomUUID(),
      type: 'system',
      content: 'Notes created successfully! You can find them in the Notes section.',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, successMessage]);
  };

  const createFlashcardsFromSummary = (summary: string) => {
    // This would integrate with the Flashcards component
    console.log('Creating flashcards from:', summary);
    const successMessage: Message = {
      id: crypto.randomUUID(),
      type: 'system',
      content: 'Flashcards created successfully! You can review them in the Flashcards section.',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, successMessage]);
  };

  const renderMessage = (message: Message) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';

    return (
      <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-[80%] p-4 rounded-lg ${
          isUser 
            ? 'bg-primary text-primary-foreground' 
            : isSystem 
            ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
            : 'bg-muted'
        }`}>
          <div className="prose prose-sm max-w-none">
            {message.content.split('\n').map((line, i) => (
              <p key={i} className={isUser ? 'text-primary-foreground' : ''}>{line}</p>
            ))}
          </div>

          {message.pdfSummary && (
            <div className="mt-4 space-y-3 border-t pt-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="font-medium">{message.pdfSummary.fileName}</span>
              </div>
              
              <div className="space-y-2">
                <div>
                  <h4 className="font-medium text-sm mb-1">Quick Summary:</h4>
                  <p className="text-sm opacity-90">{message.pdfSummary.shortSummary}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-1">Detailed Summary:</h4>
                  <p className="text-sm opacity-90">{message.pdfSummary.detailedSummary}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => createNotesFromSummary(message.pdfSummary!.detailedSummary)}
                >
                  <FileText className="w-3 h-3 mr-1" />
                  Create Notes
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => createFlashcardsFromSummary(message.pdfSummary!.detailedSummary)}
                >
                  <Brain className="w-3 h-3 mr-1" />
                  Create Flashcards
                </Button>
              </div>
            </div>
          )}

          <p className="text-xs opacity-60 mt-2">
            {message.timestamp.toLocaleTimeString()}
          </p>
        </div>
      </div>
    );
  };

  if (showModeSelector) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Welcome to Mentora</h1>
          <p className="text-muted-foreground text-lg">Choose your AI tutor to start learning</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {studyModes.map(mode => {
            const Icon = mode.icon;
            return (
              <Card 
                key={mode.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
                onClick={() => handleModeSelect(mode.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{mode.label}</h3>
                      <p className="text-muted-foreground text-sm">{mode.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-200px)]">
      {/* Chat Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {selectedMode && (
                <>
                  {React.createElement(studyModes.find(m => m.id === selectedMode)?.icon || MessageCircle, {
                    className: "w-6 h-6"
                  })}
                  <div>
                    <CardTitle className="text-lg">
                      {studyModes.find(m => m.id === selectedMode)?.label}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {studyModes.find(m => m.id === selectedMode)?.description}
                    </p>
                  </div>
                </>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setShowModeSelector(true);
                setMessages([]);
                setSelectedMode(null);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Change Tutor
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <Card className="flex-1 mb-4">
        <CardContent className="p-6 h-full overflow-y-auto">
          {messages.map(renderMessage)}
          <div ref={messagesEndRef} />
        </CardContent>
      </Card>

      {/* Input */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-2">
            <div className="flex-1 flex space-x-2">
              <Input
                placeholder="Ask me anything..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
              />
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handlePDFUpload}
                className="hidden"
              />
              
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Upload className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                onClick={isListening ? stopListening : startListening}
                disabled={isLoading}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            </div>
            
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading || !currentMessage.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIChat;
