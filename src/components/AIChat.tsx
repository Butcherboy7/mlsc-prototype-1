
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Image as ImageIcon,
  Loader2,
  ArrowLeft,
  Bot,
  User,
  Download,
  Save,
  FileText
} from 'lucide-react';
import { openAIService } from '@/lib/openai';
import { extractTextFromImage } from '@/lib/ocr';
import { exportToPDF } from '@/lib/pdf';
import StudyModeSelector from '@/components/StudyModeSelector';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageAnalysis?: string;
}

interface AIChatProps {
  selectedMode: string | null;
  onBack?: () => void;
}

const AIChat: React.FC<AIChatProps> = ({ selectedMode: initialMode, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string | null>(initialMode);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setSelectedMode(initialMode);
  }, [initialMode]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive"
      });
      return;
    }

    setUploadedImage(file);
    setIsAnalyzingImage(true);

    try {
      const analysisResult = await extractTextFromImage(file);
      
      // Handle the OCRResult properly
      const analysisText = typeof analysisResult === 'string' ? analysisResult : analysisResult?.text || '';
      
      if (analysisText && analysisText.trim()) {
        setInput(prev => prev + (prev ? '\n\n' : '') + `[Image content: ${analysisText}]`);
        toast({
          title: "Image analyzed successfully",
          description: "Content extracted and added to your message."
        });
      } else {
        toast({
          title: "No text detected",
          description: "The image doesn't contain readable text or math equations."
        });
      }
    } catch (error) {
      console.error('Image analysis failed:', error);
      toast({
        title: "Analysis failed",
        description: "Could not analyze the image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzingImage(false);
      setUploadedImage(null);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !selectedMode) return;

    const sessionId = generateSessionId();
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await openAIService.contextualChat(
        userMessage.content,
        selectedMode,
        sessionId
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const saveToNotes = (content: string, messageId: string) => {
    const existingNotes = JSON.parse(localStorage.getItem('mentora_notes') || '[]');
    const newNote = {
      id: crypto.randomUUID(),
      title: `AI Response - ${new Date().toLocaleDateString()}`,
      content: content,
      tags: ['AI Generated', selectedMode || 'AI Chat'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    existingNotes.unshift(newNote);
    localStorage.setItem('mentora_notes', JSON.stringify(existingNotes));
    
    toast({
      title: "Saved to Notes",
      description: "AI response has been saved to your notes."
    });
  };

  const exportResponseToPDF = (content: string, messageId: string) => {
    const modeTitle = selectedMode ? selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1) : 'AI';
    const timestamp = new Date().toLocaleDateString();
    exportToPDF(content, `${modeTitle}_Response_${timestamp}.pdf`);
    
    toast({
      title: "PDF Exported",
      description: "AI response has been exported as PDF."
    });
  };

  const handleModeSelect = (mode: string) => {
    setSelectedMode(mode);
    setMessages([]);
  };

  const handleModeChange = (mode: string) => {
    setSelectedMode(null);
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          )}
          <h1 className="text-2xl font-bold">AI Study Assistant</h1>
          <div className="w-20"></div>
        </div>

        {/* Study Mode Selector */}
        <StudyModeSelector
          selectedMode={selectedMode}
          onModeSelect={handleModeSelect}
          onModeChange={handleModeChange}
        />

        {selectedMode && (
          <>
            {/* Chat Messages */}
            <Card className="min-h-[400px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="w-5 h-5" />
                  <span>Conversation</span>
                  <Badge variant="secondary">{selectedMode}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 space-y-4 mb-4 max-h-96 overflow-y-auto">
                  {messages.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p>Start a conversation with your AI study assistant!</p>
                      <p className="text-sm mt-2">Upload images or ask questions to get started.</p>
                    </div>
                  )}
                  
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <div className="flex items-start space-x-2">
                          {message.role === 'assistant' ? (
                            <Bot className="w-5 h-5 mt-0.5 flex-shrink-0" />
                          ) : (
                            <User className="w-5 h-5 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                            <div className="text-xs opacity-70 mt-2">
                              {message.timestamp.toLocaleTimeString()}
                            </div>
                            
                            {/* Individual Response Actions */}
                            {message.role === 'assistant' && (
                              <div className="flex space-x-2 mt-3">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => saveToNotes(message.content, message.id)}
                                  className="h-8 px-3 text-xs"
                                >
                                  <Save className="w-3 h-3 mr-1" />
                                  Save to Notes
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => exportResponseToPDF(message.content, message.id)}
                                  className="h-8 px-3 text-xs"
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  Export PDF
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-4 flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isAnalyzingImage}
                    >
                      {isAnalyzingImage ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ImageIcon className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={`Ask your ${selectedMode} assistant anything...`}
                      className="min-h-[80px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                    />
                    <Button 
                      onClick={handleSend} 
                      disabled={!input.trim() || isLoading}
                      size="lg"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default AIChat;
