
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
  Calculator,
  Code,
  Briefcase,
  Scale,
  BookText,
  Save,
  Copy,
  Download,
  ArrowLeft
} from 'lucide-react';
import { useVoice } from '@/hooks/useVoice';
import { openAIService } from '@/lib/openai';
import { extractTextFromPDF, exportToPDF } from '@/lib/pdf';

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

  const { isListening, startListening, stopListening, isSupported } = useVoice();

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
    if (!isSupported) {
      alert('Voice input is not supported on this device/browser.');
      return;
    }

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
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const fileType = file.type;

    setIsLoading(true);

    try {
      let content = '';
      
      if (fileType === 'application/pdf') {
        content = await extractTextFromPDF(file);
      } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        content = await file.text();
      } else if (fileName.endsWith('.docx')) {
        // For .docx files, we'll read as text (simplified)
        content = await file.text();
      } else {
        throw new Error('Unsupported file type. Please upload PDF, TXT, or DOCX files.');
      }

      // Ask AI to analyze the content based on the current mode
      const modeInfo = studyModes.find(m => m.id === selectedMode);
      const analysisPrompt = `As a ${modeInfo?.label}, please analyze the following document content and provide helpful insights based on your expertise:\n\n${content.substring(0, 3000)}`;
      
      const aiResponse = await openAIService.chat([
        { role: 'system', content: modeInfo?.prompt || 'You are a helpful tutor.' },
        { role: 'user', content: analysisPrompt }
      ]);
      
      const fileMessage: Message = {
        id: crypto.randomUUID(),
        type: 'ai',
        content: `📄 **File Analysis: ${fileName}**\n\n${aiResponse}`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, fileMessage]);
    } catch (error) {
      console.error('File processing error:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        type: 'system',
        content: `Sorry, I couldn't process the file "${fileName}". ${(error as Error).message}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }

    event.target.value = '';
  };

  const saveMessageAsNote = (content: string, title: string) => {
    const existingNotes = JSON.parse(localStorage.getItem('mentora_notes') || '[]');
    const newNote = {
      id: crypto.randomUUID(),
      title,
      content,
      tags: ['AI Chat', 'Export'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    existingNotes.unshift(newNote);
    localStorage.setItem('mentora_notes', JSON.stringify(existingNotes));
    
    const successMessage: Message = {
      id: crypto.randomUUID(),
      type: 'system',
      content: `📝 Saved as note: "${title}"!`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, successMessage]);
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

          {/* AI Response Actions */}
          {!isUser && !isSystem && (
            <div className="flex gap-2 mt-3 pt-3 border-t">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => exportToPDF(message.content, 'AI Response.pdf')}
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
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => copyToClipboard(message.content)}
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
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
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-100px)]">
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
                      Powered by OpenAI GPT-3.5 Turbo
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
                accept=".pdf,.txt,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                title="Upload PDF, TXT, or DOCX file"
              >
                <Upload className="w-4 h-4" />
              </Button>
              
              {isSupported && (
                <Button
                  variant="outline"
                  onClick={handleVoiceInput}
                  disabled={isLoading}
                  title={isListening ? "Stop listening" : "Start voice input"}
                  className={isListening ? "bg-red-50 border-red-200" : ""}
                >
                  {isListening ? <MicOff className="w-4 h-4 text-red-600" /> : <Mic className="w-4 h-4" />}
                </Button>
              )}
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
