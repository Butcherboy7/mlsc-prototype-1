
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Play, 
  MessageCircle, 
  Download, 
  Save, 
  ArrowLeft,
  Loader2,
  Code,
  Terminal,
  ChevronRight
} from 'lucide-react';
import { openAIService } from '@/lib/openai';

interface CodeLabProps {
  onBack: () => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const languages = [
  { value: 'javascript', label: 'JavaScript', extension: '.js' },
  { value: 'python', label: 'Python', extension: '.py' },
  { value: 'cpp', label: 'C++', extension: '.cpp' },
  { value: 'html', label: 'HTML/CSS/JS', extension: '.html' }
];

const defaultCode = {
  javascript: `// JavaScript Example
function greet(name) {
    return \`Hello, \${name}! Welcome to CodeLab.\`;
}

console.log(greet("Developer"));
console.log("Ready to code!");`,
  python: `# Python Example
def greet(name):
    return f"Hello, {name}! Welcome to CodeLab."

print(greet("Developer"))
print("Ready to code!")`,
  cpp: `// C++ Example
#include <iostream>
#include <string>
using namespace std;

string greet(string name) {
    return "Hello, " + name + "! Welcome to CodeLab.";
}

int main() {
    cout << greet("Developer") << endl;
    cout << "Ready to code!" << endl;
    return 0;
}`,
  html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeLab</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            text-align: center; 
            background: rgba(255,255,255,0.1);
            padding: 30px;
            border-radius: 15px;
        }
        button { 
            background: #4CAF50; 
            color: white; 
            border: none; 
            padding: 12px 24px; 
            border-radius: 8px; 
            cursor: pointer; 
            font-size: 16px;
            margin: 10px;
        }
        button:hover { background: #45a049; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Welcome to CodeLab!</h1>
        <p>Interactive coding environment</p>
        <button onclick="greet()">Click me</button>
        <button onclick="showTime()">Show Time</button>
        <p id="output"></p>
    </div>
    
    <script>
        function greet() {
            document.getElementById('output').innerHTML = '👋 Hello, Developer! Welcome to CodeLab.';
        }
        
        function showTime() {
            document.getElementById('output').innerHTML = '⏰ Current time: ' + new Date().toLocaleTimeString();
        }
    </script>
</body>
</html>`
};

const CodeLab: React.FC<CodeLabProps> = ({ onBack }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState(defaultCode.javascript);
  const [output, setOutput] = useState('');
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAskingAI, setIsAskingAI] = useState(false);

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    setCode(defaultCode[language as keyof typeof defaultCode]);
    setOutput('');
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Running code...\n');

    try {
      if (selectedLanguage === 'html') {
        setOutput('HTML code ready for preview! In a full implementation, this would open in a new window or iframe.');
      } else if (selectedLanguage === 'javascript') {
        // Simple JavaScript execution simulation
        const logs: string[] = [];
        const originalLog = console.log;
        
        // Capture console.log output
        console.log = (...args: any[]) => {
          logs.push(args.join(' '));
          originalLog(...args);
        };

        try {
          // Simple eval for demonstration (in production, use a proper sandbox)
          eval(code);
          setOutput(logs.length > 0 ? logs.join('\n') : 'Code executed successfully (no output)');
        } catch (error) {
          setOutput(`Error: ${(error as Error).message}`);
        } finally {
          console.log = originalLog;
        }
      } else {
        // For Python/C++, simulate execution
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (selectedLanguage === 'python') {
          if (code.includes('print(greet("Developer"))')) {
            setOutput('Hello, Developer! Welcome to CodeLab.\nReady to code!');
          } else {
            setOutput('Code executed successfully\n(Note: In production, this would use a real Python executor like Piston API)');
          }
        } else if (selectedLanguage === 'cpp') {
          if (code.includes('greet("Developer")')) {
            setOutput('Hello, Developer! Welcome to CodeLab.\nReady to code!');
          } else {
            setOutput('Code compiled and executed successfully\n(Note: In production, this would use a real C++ compiler)');
          }
        }
      }
    } catch (error) {
      setOutput('Execution Error: ' + (error as Error).message);
    } finally {
      setIsRunning(false);
    }
  };

  const askAI = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const question = chatInput;
    setChatInput('');
    setIsAskingAI(true);

    try {
      const aiResponse = await openAIService.helpWithCode(code, selectedLanguage, question);
      
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI help error:', error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAskingAI(false);
    }
  };

  const downloadCode = () => {
    const language = languages.find(l => l.value === selectedLanguage);
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codelab-project${language?.extension || '.txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveToNotes = () => {
    const title = `CodeLab - ${languages.find(l => l.value === selectedLanguage)?.label}`;
    const content = `# ${title}\n\n\`\`\`${selectedLanguage}\n${code}\n\`\`\``;
    
    // Save to localStorage notes
    const existingNotes = JSON.parse(localStorage.getItem('mentora_notes') || '[]');
    const newNote = {
      id: crypto.randomUUID(),
      title,
      content,
      tags: ['CodeLab', 'Programming'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    existingNotes.unshift(newNote);
    localStorage.setItem('mentora_notes', JSON.stringify(existingNotes));
    
    alert('Code saved to Notes!');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <Terminal className="w-6 h-6" />
              <h1 className="text-2xl font-bold">CodeLab</h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={runCode} disabled={isRunning}>
              {isRunning ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Run
            </Button>

            <Button variant="outline" onClick={() => setIsChatOpen(!isChatOpen)}>
              <MessageCircle className="w-4 h-4 mr-2" />
              AI Help
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Editor Area */}
        <div className={`flex-1 flex flex-col ${isChatOpen ? 'mr-80' : ''}`}>
          {/* Code Editor */}
          <div className="flex-1 p-4">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Code className="w-4 h-4 mr-2" />
                    Editor
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={downloadCode}>
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" onClick={saveToNotes}>
                      <Save className="w-3 h-3 mr-1" />
                      Save to Notes
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-full">
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="h-full min-h-[400px] font-mono text-sm border-0 resize-none focus:ring-0"
                  placeholder="Write your code here..."
                />
              </CardContent>
            </Card>
          </div>

          {/* Input/Output Section */}
          <div className="h-64 p-4 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Input</CardTitle>
                </CardHeader>
                <CardContent className="p-0 h-full">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="h-full min-h-[120px] text-sm border-0 resize-none focus:ring-0"
                    placeholder="Enter input for your program..."
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    Output
                    {isRunning && <Loader2 className="w-3 h-3 ml-2 animate-spin" />}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 h-full">
                  <div className="h-full min-h-[120px] p-3 bg-black text-green-400 font-mono text-sm overflow-auto whitespace-pre-wrap">
                    {output || 'Run your code to see output here...'}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* AI Chat Sidebar */}
        {isChatOpen && (
          <div className="w-80 border-l bg-card flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">AI Coding Assistant</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsChatOpen(false)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Ask questions about your code, get help with bugs, or learn new concepts.
              </p>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Ask me anything about your code!</p>
                </div>
              ) : (
                chatMessages.map(message => (
                  <div key={message.id} className={`p-3 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-primary text-primary-foreground ml-4' 
                      : 'bg-muted mr-4'
                  }`}>
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
              {isAskingAI && (
                <div className="bg-muted p-3 rounded-lg mr-4">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about your code..."
                  className="min-h-[60px] resize-none"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      askAI();
                    }
                  }}
                />
                <Button onClick={askAI} disabled={isAskingAI || !chatInput.trim()}>
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeLab;
