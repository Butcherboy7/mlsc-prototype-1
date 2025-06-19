
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
  Copy,
  Download,
  Key
} from 'lucide-react';
import { useVoice } from '@/hooks/useVoice';
import { openAIService } from '@/lib/openai';
import { extractTextFromPDF, exportToPDF } from '@/lib/pdf';
import APIKeySettings from './APIKeySettings';

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
  { id: 'maths' as StudyMode, label: 'Maths Tutor', icon: Calculator, prompt: 'You are an expert mathematics tutor. Help students understand mathematical concepts, solve problems step-by-step, and provide clear explanations.' },
  { id: 'coding' as StudyMode, label: 'Code Mentor', icon: Code, prompt: 'You are a programming expert and mentor. Help with coding problems, explain programming concepts, review code, and guide best practices across multiple programming languages.' },
  { id: 'business' as StudyMode, label: 'Business Coach', icon: Briefcase, prompt: 'You are a business strategy coach. Help with startup advice, business planning, marketing strategies, financial planning, and entrepreneurship guidance.' },
  { id: 'law' as StudyMode, label: 'Legal Advisor', icon: Scale, prompt: 'You are a legal education advisor. Help explain legal concepts, constitutional law, case studies, and legal principles for educational purposes.' },
  { id: 'literature' as StudyMode, label: 'Literature Guide', icon: BookText, prompt: 'You are a literature and writing expert. Help with literary analysis, creative writing, critical thinking, essay writing, and understanding literary works.' }
];

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [selectedMode, setSelectedMode] = useState<StudyMode | null>(null);
  const [showModeSelector, setShowModeSelector] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isListening, startListening, stopListening } = useVoice();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Check if API key is available
    if (!openAIService.getApiKey()) {
      setShowApiSettings(true);
    }
  }, []);

  const handleModeSelect = (mode: StudyMode) => {
    setSelectedMode(mode);
    setShowModeSelector(false);
    
    const modeInfo = studyModes.find(m => m.id === mode);
    const welcomeMessage: Message = {
      id: crypto.randomUUID(),
      type: 'ai',
      content: `Hello! I'm your ${modeInfo?.label}. ${modeInfo?.prompt.split('.')[1]} How can I help you learn today?`,
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
    if (!currentMessage.trim() || !selectedMode || isLoading) return;

    if (!openAIService.getApiKey()) {
      setShowApiSettings(true);
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = currentMessage;
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const modeInfo = studyModes.find(m => m.id === selectedMode);
      const response = await openAIService.chat([
        { role: 'system', content: modeInfo?.prompt || 'You are a helpful tutor.' },
        { role: 'user', content: messageToSend }
      ]);
      
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        type: 'ai',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        type: 'system',
        content: 'Sorry, I encountered an error. Please check your API key and try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !openAIService.getApiKey()) return;

    setIsLoading(true);

    try {
      const extractedContent = await extractTextFromPDF(file);
      
      // Generate both summaries
      const [shortSummary, detailedSummary] = await Promise.all([
        openAIService.summarizePDF(extractedContent, 'short'),
        openAIService.summarizePDF(extractedContent, 'detailed')
      ]);
      
      const pdfMessage: Message = {
        id: crypto.randomUUID(),
        type: 'ai',
        content: `I've analyzed your PDF "${file.name}". Here are the AI-generated summaries:`,
        timestamp: new Date(),
        pdfSummary: {
          fileName: file.name,
          actualContent: extractedContent,
          shortSummary,
          detailedSummary,
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
    } finally {
      setIsLoading(false);
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
      const lines = summary.split('\n').filter(line => line.trim().length > 10);
      const keyPoints = lines.slice(0, 5);
      
      keyPoints.forEach((point, index) => {
        const question = `What is key concept #${index + 1} from ${fileName}?`;
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

  const exportMessageAsPDF = (content: string, fileName: string) => {
    exportToPDF(content, fileName);
  };

  const saveMessageAsNote = (content: string, title: string) => {
    if ((window as any).addNoteFromAIChat) {
      (window as any).addNoteFromAIChat(title, content, ['AI Chat', 'Export']);
      
      const successMessage: Message = {
        id: crypto.randomUUID(),
        type: 'system',
        content: `📝 Saved as note: "${title}"!`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, successMessage]);
    }
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

          {/* AI Response Actions */}
          {!isUser && !isSystem && (
            <div className="flex gap-2 mt-3 pt-3 border-t">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => exportMessageAsPDF(message.content, 'AI Response.pdf')}
              >
                <Download className="w-3 h-3 mr-1" />
                Export PDF
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => saveMessageAsNote(message.content, `AI Response - ${new Date().toLocaleDateString()}`)}
              >
                <Save className="w-3 h-3 mr-1" />
                Save as Note
              </Button>
            </div>
          )}

          {message.pdfSummary && (
            <div className="mt-4 space-y-4 border-t pt-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="font-medium">{message.pdfSummary.fileName}</span>
              </div>
              
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm text-green-800">📋 Short Summary</h4>
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
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => exportToPDF(message.pdfSummary!.detailedSummary, `${message.pdfSummary!.fileName}-summary.pdf`)}
                  className="flex-1"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Export PDF
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

  if (showApiSettings) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <APIKeySettings onApiKeySet={() => setShowApiSettings(false)} />
        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            You need an OpenAI API key to use the AI features. Get one from{' '}
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              OpenAI's website
            </a>
          </p>
        </div>
      </div>
    );
  }

  if (showModeSelector) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Welcome to Mentora</h1>
          <p className="text-muted-foreground text-lg">Choose your AI tutor to start learning</p>
          
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => setShowApiSettings(true)}>
              <Key className="w-4 h-4 mr-2" />
              API Settings
            </Button>
          </div>
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
                      <p className="text-muted-foreground text-sm">{mode.prompt.split('.')[0]}.</p>
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
                      Powered by OpenAI GPT
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowApiSettings(true)}
              >
                <Key className="w-4 h-4 mr-2" />
                API Settings
              </Button>
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
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <Card className="flex-1 mb-4">
        <CardContent className="p-6 h-full overflow-y-auto">
          {messages.map(renderMessage)}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
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
