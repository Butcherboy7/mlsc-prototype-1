import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Image as ImageIcon,
  Loader2,
  ArrowLeft,
  Bot,
  User,
  Download,
  Save,
  FileText,
  BookOpen,
  Plus,
  MessageSquare,
  Trash2
} from 'lucide-react';
import { geminiService } from '@/lib/gemini';
import { extractTextFromImage } from '@/lib/ocr';
import { exportToPDF } from '@/lib/pdf';
import StudyModeSelector from '@/components/StudyModeSelector';
import QuickActionButtons from '@/components/QuickActionButtons';
import TestKnowledgeModal from '@/components/TestKnowledgeModal';
import VideoSearchButton from '@/components/VideoSearchButton';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: number;
  chatId: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Chat {
  id: number;
  title: string;
  mode: string;
  createdAt: Date;
  updatedAt: Date;
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
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testModalContent, setTestModalContent] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [showChatList, setShowChatList] = useState(false);
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

  // Load chats when mode is selected
  useEffect(() => {
    if (selectedMode) {
      loadChats();
    }
  }, [selectedMode]);

  // Load messages when chat is selected
  useEffect(() => {
    if (currentChatId) {
      loadMessages(currentChatId);
    } else {
      setMessages([]);
    }
  }, [currentChatId]);

  const loadChats = async () => {
    try {
      const response = await fetch('/api/chats');
      if (!response.ok) throw new Error('Failed to load chats');
      const allChats: Chat[] = await response.json();
      
      // Filter chats by the selected mode
      const filteredChats = allChats
        .filter(chat => chat.mode === selectedMode)
        .map(chat => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt)
        }));
      
      setChats(filteredChats);
      
      // Auto-select the most recent chat if one exists
      if (filteredChats.length > 0 && !currentChatId) {
        setCurrentChatId(filteredChats[0].id);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      toast({
        title: "Error",
        description: "Failed to load chats.",
        variant: "destructive"
      });
    }
  };

  const loadMessages = async (chatId: number) => {
    try {
      const response = await fetch(`/api/chats/${chatId}/messages`);
      if (!response.ok) throw new Error('Failed to load messages');
      const loadedMessages: Message[] = await response.json();
      
      setMessages(loadedMessages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })));
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages.",
        variant: "destructive"
      });
    }
  };

  const createNewChat = async () => {
    if (!selectedMode) return;
    
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `New ${selectedMode} Chat`,
          mode: selectedMode
        })
      });
      
      if (!response.ok) throw new Error('Failed to create chat');
      const newChat: Chat = await response.json();
      
      setChats(prev => [{
        ...newChat,
        createdAt: new Date(newChat.createdAt),
        updatedAt: new Date(newChat.updatedAt)
      }, ...prev]);
      setCurrentChatId(newChat.id);
      setMessages([]);
      
      toast({
        title: "New Chat Created",
        description: "Start a new conversation!"
      });
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: "Error",
        description: "Failed to create new chat.",
        variant: "destructive"
      });
    }
  };

  const deleteChat = async (chatId: number) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete chat');
      
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      
      if (currentChatId === chatId) {
        const remainingChats = chats.filter(chat => chat.id !== chatId);
        setCurrentChatId(remainingChats.length > 0 ? remainingChats[0].id : null);
      }
      
      toast({
        title: "Chat Deleted",
        description: "The conversation has been removed."
      });
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast({
        title: "Error",
        description: "Failed to delete chat.",
        variant: "destructive"
      });
    }
  };

  const saveMessageToDatabase = async (chatId: number, role: 'user' | 'assistant', content: string): Promise<Message> => {
    const response = await fetch(`/api/chats/${chatId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, content })
    });
    
    if (!response.ok) throw new Error('Failed to save message');
    const savedMessage: Message = await response.json();
    
    return {
      ...savedMessage,
      timestamp: new Date(savedMessage.timestamp)
    };
  };

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

    // Create a new chat if one doesn't exist
    if (!currentChatId) {
      await createNewChat();
      // Wait a bit for the chat to be created
      await new Promise(resolve => setTimeout(resolve, 500));
      // The useEffect will reload and set currentChatId
      if (!currentChatId) {
        toast({
          title: "Error",
          description: "Failed to create chat. Please try again.",
          variant: "destructive"
        });
        return;
      }
    }

    const userContent = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // Save user message to database
      const savedUserMessage = await saveMessageToDatabase(currentChatId!, 'user', userContent);
      setMessages(prev => [...prev, savedUserMessage]);

      // Prepare messages for AI
      const geminiMessages = [
        {
          role: 'system' as const,
          content: geminiService.getSystemMessage(selectedMode)
        },
        ...messages.map(msg => ({
          role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        })),
        {
          role: 'user' as const,
          content: userContent
        }
      ];

      const response = await geminiService.chat(geminiMessages, true);

      // Save assistant response to database
      const savedAssistantMessage = await saveMessageToDatabase(currentChatId!, 'assistant', response);
      setMessages(prev => [...prev, savedAssistantMessage]);
      
      // Update chat title if this is the first message
      if (messages.length === 0) {
        updateChatTitle(currentChatId!, userContent);
      }
    } catch (error) {
      console.error('AI Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateChatTitle = async (chatId: number, firstMessage: string) => {
    try {
      const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      
      if (response.ok) {
        const updatedChat: Chat = await response.json();
        setChats(prev => prev.map(chat => 
          chat.id === chatId 
            ? { ...updatedChat, createdAt: new Date(updatedChat.createdAt), updatedAt: new Date(updatedChat.updatedAt) }
            : chat
        ));
      }
    } catch (error) {
      console.error('Error updating chat title:', error);
    }
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
    setCurrentChatId(null);
  };

  const handleModeChange = (mode: string) => {
    setSelectedMode(null);
    setMessages([]);
    setCurrentChatId(null);
  };

  const handleQuickAction = async (action: string, prompt: string) => {
    if (!selectedMode) return;
    setInput(prompt);
    setTimeout(() => handleSend(), 100);
  };

  const openTestKnowledge = (content: string) => {
    setTestModalContent(content);
    setTestModalOpen(true);
  };

  const formatAIResponse = (content: string) => {
    let formatted = content;
    
    // Format math expressions (LaTeX-style)
    formatted = formatted.replace(/\$\$([^$]+)\$\$/g, '<div class="math-block bg-muted/50 p-4 rounded-lg my-4 text-center font-mono text-lg border-l-4 border-primary">$1</div>');
    formatted = formatted.replace(/\$([^$]+)\$/g, '<span class="math-inline bg-muted/30 px-2 py-1 rounded font-mono">$1</span>');
    
    // Format fractions and mathematical notation
    formatted = formatted.replace(/(\d+)\/(\d+)/g, '<span class="fraction"><sup>$1</sup>⁄<sub>$2</sub></span>');
    formatted = formatted.replace(/\^(\d+)/g, '<sup>$1</sup>');
    formatted = formatted.replace(/_(\d+)/g, '<sub>$1</sub>');
    
    // Format code blocks with enhanced styling
    formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)\n```/g, (match, lang, code) => {
      return `<div class="code-block bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto my-4 border border-border">
        ${lang ? `<div class="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-semibold">${lang}</div>` : ''}
        <pre class="text-foreground">${code}</pre>
      </div>`;
    });
    
    // Format inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-muted px-2 py-1 rounded text-sm font-mono border">$1</code>');
    
    // Format headers with better styling
    formatted = formatted.replace(/^###\s+(.+)$/gm, '<h3 class="text-xl font-bold mt-6 mb-3 text-foreground border-b border-border pb-2">$1</h3>');
    formatted = formatted.replace(/^##\s+(.+)$/gm, '<h2 class="text-2xl font-bold mt-8 mb-4 text-foreground">$1</h2>');
    formatted = formatted.replace(/^#\s+(.+)$/gm, '<h1 class="text-3xl font-bold mt-8 mb-6 text-foreground">$1</h1>');
    
    // Enhanced bullet points with better spacing
    formatted = formatted.replace(/^[-*•]\s+(.+)$/gm, '<div class="flex items-start my-2 pl-2"><span class="text-primary mr-3 mt-1 font-bold">•</span><span class="flex-1">$1</span></div>');
    
    // Enhanced numbered lists
    formatted = formatted.replace(/^(\d+)\.\s+(.+)$/gm, '<div class="flex items-start my-2 pl-2"><span class="text-primary font-bold mr-3 min-w-[2rem] text-right">$1.</span><span class="flex-1">$2</span></div>');
    
    // Format bold text with better contrast
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-foreground bg-primary/10 px-1 rounded">$1</strong>');
    
    // Format definitions (term: definition)
    formatted = formatted.replace(/^([A-Za-z\s]+):\s+(.+)$/gm, '<div class="definition my-3 p-3 bg-muted/30 rounded-lg border-l-4 border-primary"><strong class="text-primary">$1:</strong> <span>$2</span></div>');
    
    // Format examples sections
    formatted = formatted.replace(/Example:\s*(.+)/gi, '<div class="example my-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"><div class="font-semibold text-green-800 dark:text-green-300 mb-2">📝 Example:</div><div>$1</div></div>');
    
    // Format real-life analogy sections
    formatted = formatted.replace(/Real-life analogy:\s*(.+)/gi, '<div class="analogy my-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"><div class="font-semibold text-blue-800 dark:text-blue-300 mb-2">🌍 Real-Life Analogy:</div><div>$1</div></div>');
    
    return formatted;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2 transition-all duration-200 hover:scale-105">
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            {/* Chat List Sidebar */}
            <Card className="md:col-span-1 h-fit max-h-[700px] overflow-hidden">
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Conversations</span>
                  <Button size="sm" onClick={createNewChat} className="h-8 w-8 p-0">
                    <Plus className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 space-y-2 max-h-[600px] overflow-y-auto">
                {chats.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-4">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No chats yet</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={createNewChat}
                      className="mt-2"
                    >
                      Create First Chat
                    </Button>
                  </div>
                ) : (
                  chats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                        currentChatId === chat.id ? 'bg-primary/10 border-2 border-primary' : 'bg-muted/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div 
                          className="flex-1 min-w-0"
                          onClick={() => setCurrentChatId(chat.id)}
                        >
                          <p className="text-sm font-medium truncate">{chat.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(chat.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChat(chat.id);
                          }}
                          className="h-6 w-6 p-0 opacity-60 hover:opacity-100 hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Chat Messages */}
            <Card className="md:col-span-3 min-h-[600px] sm:min-h-[700px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="w-5 h-5" />
                  <span>Conversation</span>
                  <Badge variant="secondary">{selectedMode}</Badge>
                  {currentChatId && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {chats.find(c => c.id === currentChatId)?.title}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 space-y-4 mb-4 max-h-[450px] sm:max-h-[550px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-background mobile-optimized">
                  {!currentChatId && (
                    <div className="text-center text-muted-foreground py-8">
                      <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p>Create a new chat to start a conversation!</p>
                      <Button 
                        size="lg" 
                        onClick={createNewChat}
                        className="mt-4"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        New Chat
                      </Button>
                    </div>
                  )}
                  
                  {currentChatId && messages.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p>Start a conversation with your AI study assistant!</p>
                      <p className="text-sm mt-2">Upload images or ask questions to get started.</p>
                    </div>
                  )}
                  
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div 
                        key={message.id} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} px-2`}
                      >
                        <div className={`max-w-[90%] sm:max-w-[85%] md:max-w-[80%] rounded-lg p-3 sm:p-4 break-words transition-all duration-200 hover:shadow-md mobile-overflow-wrap ${
                          message.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          <div className="flex items-start space-x-2">
                            {message.role === 'assistant' ? (
                              <Bot className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                            ) : (
                              <User className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0 overflow-hidden">
                              <div 
                                className="text-sm break-words overflow-wrap-anywhere"
                                dangerouslySetInnerHTML={{ 
                                  __html: message.role === 'assistant' 
                                    ? formatAIResponse(message.content) 
                                    : message.content.replace(/\n/g, '<br/>')
                                }}
                              />
                              <div className="text-xs opacity-70 mt-2">
                                {message.timestamp.toLocaleTimeString()}
                              </div>
                              
                              {/* Individual Response Actions */}
                              {message.role === 'assistant' && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => saveToNotes(message.content, message.id.toString())}
                                    className="h-8 px-2 sm:px-3 text-xs transition-all duration-200 hover:scale-105"
                                  >
                                    <Save className="w-3 h-3 mr-1" />
                                    <span className="hidden sm:inline">Save to Notes</span>
                                    <span className="sm:hidden">Save</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => exportResponseToPDF(message.content, message.id.toString())}
                                    className="h-8 px-2 sm:px-3 text-xs transition-all duration-200 hover:scale-105"
                                  >
                                    <FileText className="w-3 h-3 mr-1" />
                                    <span className="hidden sm:inline">Export PDF</span>
                                    <span className="sm:hidden">PDF</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openTestKnowledge(message.content)}
                                    className="h-8 px-2 sm:px-3 text-xs transition-all duration-200 hover:scale-105"
                                  >
                                    <BookOpen className="w-3 h-3 mr-1" />
                                    <span className="hidden sm:inline">Test Knowledge</span>
                                    <span className="sm:hidden">Test</span>
                                  </Button>
                                  <VideoSearchButton 
                                    content={message.content}
                                    mode={selectedMode || 'general'}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {isLoading && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-muted rounded-lg p-4 flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                {currentChatId && (
                  <div className="space-y-3">
                    {/* Quick Action Buttons */}
                    <QuickActionButtons 
                      onAction={handleQuickAction}
                      disabled={isLoading}
                      currentMessage={input}
                    />
                    
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
                        className="transition-all duration-200 hover:scale-105"
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
                        className="min-h-[80px] sm:min-h-[60px] resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20 mobile-text-sm"
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
                        className="transition-all duration-200 hover:scale-105 min-w-[3rem]"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Test Knowledge Modal */}
        <TestKnowledgeModal
          isOpen={testModalOpen}
          onClose={() => setTestModalOpen(false)}
          originalContent={testModalContent}
          mode={selectedMode || 'general'}
        />
      </div>
    </div>
  );
};

export default AIChat;
