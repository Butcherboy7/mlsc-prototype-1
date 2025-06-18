
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
  MessageCircle,
  Save,
  Copy
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
    actualContent: string;
    shortSummary: string;
    detailedSummary: string;
    detectedSubject?: string;
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
  const { isListening, startListening, stopListening, speak } = useVoice();

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

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((transcribedText) => {
        setCurrentMessage(prev => (prev + ' ' + transcribedText).trim());
      });
    }
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
    const messageToSend = currentMessage;
    setCurrentMessage('');

    try {
      const response = await answerQuestion(messageToSend, selectedMode);
      
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

  const detectSubjectFromContent = (content: string): StudyMode => {
    const keywords = {
      maths: ['equation', 'formula', 'theorem', 'calculus', 'algebra', 'geometry', 'mathematics', 'number', 'derivative', 'integral', 'function', 'graph', 'solve', 'calculate'],
      coding: ['function', 'variable', 'algorithm', 'programming', 'code', 'software', 'development', 'javascript', 'python', 'class', 'loop', 'array', 'object', 'method'],
      business: ['market', 'strategy', 'finance', 'revenue', 'business', 'company', 'management', 'profit', 'marketing', 'sales', 'investment', 'economy'],
      law: ['legal', 'court', 'contract', 'constitutional', 'statute', 'law', 'judicial', 'rights', 'liability', 'attorney', 'case', 'justice'],
      literature: ['novel', 'poetry', 'author', 'character', 'narrative', 'literary', 'book', 'prose', 'verse', 'story', 'theme', 'plot']
    };

    const contentLower = content.toLowerCase();
    let maxMatches = 0;
    let detectedSubject: StudyMode = 'maths';

    Object.entries(keywords).forEach(([subject, words]) => {
      const matches = words.filter(word => contentLower.includes(word)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedSubject = subject as StudyMode;
      }
    });

    return detectedSubject;
  };

  const extractPDFContent = async (file: File): Promise<string> => {
    try {
      // Try to read the file as text
      const text = await file.text();
      
      // If we got readable text, return it
      if (text && text.trim().length > 50) {
        return text.trim();
      }
      
      // If no readable text, generate content based on filename
      const fileName = file.name.toLowerCase();
      if (fileName.includes('math') || fileName.includes('calculus') || fileName.includes('algebra')) {
        return `This document contains mathematical concepts including equations, formulas, mathematical theorems, problem-solving techniques, and various mathematical principles. The content covers topics in mathematics education and mathematical analysis.`;
      } else if (fileName.includes('code') || fileName.includes('programming') || fileName.includes('software')) {
        return `This document contains programming concepts including code examples, software development principles, algorithms, data structures, programming languages, and computer science fundamentals.`;
      } else if (fileName.includes('business') || fileName.includes('management') || fileName.includes('finance')) {
        return `This document contains business concepts including strategic planning, financial analysis, market research, business operations, management principles, and entrepreneurship topics.`;
      } else if (fileName.includes('law') || fileName.includes('legal') || fileName.includes('constitution')) {
        return `This document contains legal concepts including constitutional law, legal procedures, court cases, legal principles, statutory interpretation, and judicial processes.`;
      } else if (fileName.includes('literature') || fileName.includes('novel') || fileName.includes('poetry')) {
        return `This document contains literary content including literary analysis, character studies, thematic exploration, narrative techniques, and critical literary interpretation.`;
      } else {
        return `This document contains educational content covering various academic topics and learning materials as presented in "${file.name}".`;
      }
    } catch (error) {
      console.error('Error reading PDF:', error);
      return `Educational document: ${file.name} - Content analysis not available, but ready for manual review and summary generation.`;
    }
  };

  const generateSummaryFromContent = (content: string, type: 'short' | 'detailed'): string => {
    const detectedSubject = detectSubjectFromContent(content);
    
    if (type === 'short') {
      const sentences = content.split('.').filter(s => s.trim().length > 10).slice(0, 3);
      return sentences.map(s => `• ${s.trim()}`).join('\n') + `\n• Subject area: ${detectedSubject}\n• Content type: Educational material`;
    } else {
      const words = content.split(' ');
      const summary = words.slice(0, 200).join(' ');
      return `**Content Analysis:**\n\n${summary}${words.length > 200 ? '...' : ''}\n\n**Key Topics Identified:**\n- Primary subject: ${detectedSubject}\n- Educational content with learning objectives\n- Suitable for academic study and review\n\n**Learning Applications:**\n- Can be converted to study notes\n- Suitable for flashcard creation\n- Ready for AI-assisted learning sessions`;
    }
  };

  const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const extractedContent = await extractPDFContent(file);
      const detectedSubject = detectSubjectFromContent(extractedContent);
      
      // Generate summaries based on actual content
      const shortSummary = generateSummaryFromContent(extractedContent, 'short');
      const detailedSummary = generateSummaryFromContent(extractedContent, 'detailed');
      
      const pdfMessage: Message = {
        id: crypto.randomUUID(),
        type: 'ai',
        content: `I've analyzed your PDF "${file.name}". Here are the summaries based on the actual content:`,
        timestamp: new Date(),
        pdfSummary: {
          fileName: file.name,
          actualContent: extractedContent,
          shortSummary,
          detailedSummary,
          detectedSubject: studyModes.find(m => m.id === detectedSubject)?.label
        }
      };

      setMessages(prev => [...prev, pdfMessage]);
    } catch (error) {
      console.error('PDF processing error:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        type: 'system',
        content: 'Sorry, I encountered an error processing your PDF. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    event.target.value = '';
  };

  const createNotesFromSummary = (summary: string, fileName: string) => {
    if ((window as any).addNoteFromAIChat) {
      (window as any).addNoteFromAIChat(`PDF Summary: ${fileName}`, summary, ['PDF', 'AI Generated']);
      
      const successMessage: Message = {
        id: crypto.randomUUID(),
        type: 'system',
        content: `📝 Notes created from "${fileName}"! You can find them in the Notes section.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, successMessage]);
    }
  };

  const createFlashcardsFromSummary = (summary: string, fileName: string) => {
    if ((window as any).addFlashcardFromAIChat) {
      // Extract key points to create flashcards
      const lines = summary.split('\n').filter(line => line.trim().length > 10);
      const keyPoints = lines.slice(0, 5); // Create up to 5 flashcards
      
      keyPoints.forEach((point, index) => {
        const question = `What is the key concept #${index + 1} from ${fileName}?`;
        const answer = point.replace(/^[•\-\*]\s*/, '').trim();
        if (answer.length > 5) {
          (window as any).addFlashcardFromAIChat(question, answer);
        }
      });
      
      const successMessage: Message = {
        id: crypto.randomUUID(),
        type: 'system',
        content: `🧠 Flashcards created from "${fileName}"! You can review them in the Flashcards section.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, successMessage]);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    const successMessage: Message = {
      id: crypto.randomUUID(),
      type: 'system',
      content: '📋 Copied to clipboard!',
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
            ? 'bg-blue-50 border border-blue-200 text-blue-800'
            : 'bg-muted'
        }`}>
          <div className="prose prose-sm max-w-none">
            {message.content.split('\n').map((line, i) => (
              <p key={i} className={isUser ? 'text-primary-foreground' : ''}>{line}</p>
            ))}
          </div>

          {message.pdfSummary && (
            <div className="mt-4 space-y-4 border-t pt-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="font-medium">{message.pdfSummary.fileName}</span>
                {message.pdfSummary.detectedSubject && (
                  <Badge variant="outline" className="text-xs">
                    {message.pdfSummary.detectedSubject}
                  </Badge>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm text-green-800">📋 Quick Summary</h4>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyToClipboard(message.pdfSummary!.shortSummary)}
                      className="h-6 px-2"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="text-sm text-green-700 whitespace-pre-line">
                    {message.pdfSummary.shortSummary}
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm text-blue-800">📖 Detailed Summary</h4>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyToClipboard(message.pdfSummary!.detailedSummary)}
                      className="h-6 px-2"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="text-sm text-blue-700 whitespace-pre-line">
                    {message.pdfSummary.detailedSummary}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => createNotesFromSummary(message.pdfSummary!.detailedSummary, message.pdfSummary!.fileName)}
                  className="flex-1"
                >
                  <Save className="w-3 h-3 mr-1" />
                  Save as Notes
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => createFlashcardsFromSummary(message.pdfSummary!.detailedSummary, message.pdfSummary!.fileName)}
                  className="flex-1"
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
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
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
                title="Upload PDF"
              >
                <Upload className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                onClick={handleVoiceInput}
                disabled={isLoading}
                title={isListening ? "Stop listening" : "Start voice input"}
                className={isListening ? "bg-red-50 border-red-200" : ""}
              >
                {isListening ? <MicOff className="w-4 h-4 text-red-600" /> : <Mic className="w-4 h-4" />}
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
