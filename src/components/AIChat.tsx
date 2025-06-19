import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Key,
  ArrowLeft
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

interface AIChatProps {
  selectedMode: string | null;
  onBack: () => void;
}

const studyModes = [
  { id: 'maths', label: 'Maths Tutor', icon: Calculator, prompt: 'You are an expert mathematics tutor. Help students understand mathematical concepts, solve problems step-by-step, and provide clear explanations with examples.' },
  { id: 'coding', label: 'Code Mentor', icon: Code, prompt: 'You are a programming expert and mentor. Help with coding problems, explain programming concepts, review code, and guide best practices across multiple programming languages.' },
  { id: 'business', label: 'Business Coach', icon: Briefcase, prompt: 'You are a business strategy coach. Help with startup advice, business planning, marketing strategies, financial planning, and entrepreneurship guidance.' },
  { id: 'legal', label: 'Legal Advisor', icon: Scale, prompt: 'You are a legal education advisor. Help explain legal concepts, constitutional law, case studies, and legal principles for educational purposes.' },
  { id: 'literature', label: 'Literature Guide', icon: BookText, prompt: 'You are a literature and writing expert. Help with literary analysis, creative writing, critical thinking, essay writing, and understanding literary works.' }
];

const AIChat: React.FC<AIChatProps> = ({ selectedMode, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isListening, startListening, stopListening } = useVoice();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (selectedMode) {
      const modeInfo = studyModes.find(m => m.id === selectedMode);
      if (modeInfo) {
        const welcomeMessage: Message = {
          id: crypto.randomUUID(),
          type: 'ai',
          content: `Hello! I'm your ${modeInfo.label}. I'm here to help you learn and understand ${selectedMode === 'maths' ? 'mathematics' : selectedMode === 'coding' ? 'programming' : selectedMode === 'business' ? 'business concepts' : selectedMode === 'legal' ? 'legal principles' : 'literature'}. What would you like to explore today?`,
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
    }
  }, [selectedMode]);

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
    if (!file) return;

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

  if (!selectedMode) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <h2 className="text-2xl font-bold">No study mode selected</h2>
        <p className="text-muted-foreground">Please select a study mode from the dashboard.</p>
        <Button onClick={onBack}>Back to Dashboard</Button>
      </div>
    );
  }

  const currentModeInfo = studyModes.find(m => m.id === selectedMode);

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-200px)]">
      {/* Chat Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {currentModeInfo && (
                <>
                  {React.createElement(currentModeInfo.icon, {
                    className: "w-6 h-6"
                  })}
                  <div>
                    <CardTitle className="text-lg">
                      {currentModeInfo.label}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Powered by OpenAI GPT-4
                    </p>
                  </div>
                </>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
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
