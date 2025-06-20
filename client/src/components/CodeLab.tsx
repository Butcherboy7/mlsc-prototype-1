import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  MessageCircle, 
  Download, 
  Save, 
  ArrowLeft,
  Loader2,
  Code,
  Terminal,
  ChevronRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { geminiService } from '@/lib/gemini';
import { pistonService } from '@/lib/piston';

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
  javascript: `// Welcome to CodeLab! 🚀
// Let's start with a simple example

function greetUser(name) {
    return \`Hello, \${name}! Welcome to CodeLab.\`;
}

function calculateSum(a, b) {
    return a + b;
}

// Test the functions
console.log(greetUser("Developer"));
console.log("5 + 3 =", calculateSum(5, 3));
console.log("Ready to code amazing things!");`,

  python: `# Welcome to CodeLab! 🚀
# Let's start with a simple Python example

def greet_user(name):
    return f"Hello, {name}! Welcome to CodeLab."

def calculate_sum(a, b):
    return a + b

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Test the functions
print(greet_user("Developer"))
print(f"5 + 3 = {calculate_sum(5, 3)}")
print(f"Fibonacci of 7: {fibonacci(7)}")
print("Ready to code amazing things!")`,

  cpp: `// Welcome to CodeLab! 🚀
// Let's start with a simple C++ example

#include <iostream>
#include <string>
#include <vector>
using namespace std;

string greetUser(string name) {
    return "Hello, " + name + "! Welcome to CodeLab.";
}

int calculateSum(int a, int b) {
    return a + b;
}

int main() {
    cout << greetUser("Developer") << endl;
    cout << "5 + 3 = " << calculateSum(5, 3) << endl;
    
    vector<int> numbers = {1, 2, 3, 4, 5};
    cout << "Array: ";
    for(int num : numbers) {
        cout << num << " ";
    }
    cout << endl;
    cout << "Ready to code amazing things!" << endl;
    
    return 0;
}`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🚀 CodeLab Playground</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            text-align: center;
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        h1 {
            font-size: 3em;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        button { 
            background: linear-gradient(45deg, #4CAF50, #45a049);
            color: white; 
            border: none; 
            padding: 15px 30px; 
            border-radius: 25px; 
            cursor: pointer; 
            font-size: 18px;
            margin: 15px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        button:hover { 
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }
        #output {
            margin-top: 30px;
            padding: 20px;
            background: rgba(255,255,255,0.2);
            border-radius: 15px;
            min-height: 60px;
            font-size: 18px;
        }
        .feature {
            display: inline-block;
            margin: 10px;
            padding: 10px 20px;
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Welcome to CodeLab!</h1>
        <p style="font-size: 1.2em; margin-bottom: 30px;">Interactive Coding Environment</p>
        
        <div class="feature">✨ Live Preview</div>
        <div class="feature">🤖 AI Assistant</div>
        <div class="feature">💾 Auto Save</div>
        
        <div style="margin: 40px 0;">
            <button onclick="greet()">👋 Say Hello</button>
            <button onclick="showTime()">⏰ Current Time</button>
            <button onclick="randomColor()">🎨 Random Color</button>
            <button onclick="calculate()">🧮 Quick Math</button>
        </div>
        
        <div id="output">Click any button to see the magic! ✨</div>
    </div>
    
    <script>
        function greet() {
            const greetings = ['Hello!', 'Hi there!', 'Welcome!', 'Greetings!', 'Hey!'];
            const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
            document.getElementById('output').innerHTML = 
                \`👋 \${randomGreeting} Welcome to CodeLab, Developer! Ready to create amazing things?\`;
        }
        
        function showTime() {
            const now = new Date();
            document.getElementById('output').innerHTML = 
                \`⏰ Current time: \${now.toLocaleTimeString()}<br>📅 Date: \${now.toLocaleDateString()}\`;
        }
        
        function randomColor() {
            const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            document.body.style.background = \`linear-gradient(135deg, \${randomColor}, #764ba2)\`;
            document.getElementById('output').innerHTML = 
                \`🎨 New color applied: \${randomColor}! The page background changed!\`;
        }
        
        function calculate() {
            const num1 = Math.floor(Math.random() * 100);
            const num2 = Math.floor(Math.random() * 100);
            const operations = ['+', '-', '*'];
            const op = operations[Math.floor(Math.random() * operations.length)];
            let result;
            
            switch(op) {
                case '+': result = num1 + num2; break;
                case '-': result = num1 - num2; break;
                case '*': result = num1 * num2; break;
            }
            
            document.getElementById('output').innerHTML = 
                \`🧮 Random calculation: \${num1} \${op} \${num2} = \${result}\`;
        }
        
        // Welcome animation
        setTimeout(() => {
            document.getElementById('output').innerHTML = 
                '🎉 CodeLab is ready! Try the buttons above to see interactive examples.';
        }, 1000);
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
    setOutput('🚀 Running your code...\n');

    try {
      if (selectedLanguage === 'html') {
        setOutput('✅ HTML code is ready! In a full implementation, this would render in a live preview window.\n\n📋 Your HTML includes:\n- Modern styling with CSS\n- Interactive JavaScript functions\n- Responsive design elements');
      } else {
        // Use Piston API for real code execution
        const pistonLanguage = pistonService.mapLanguageName(
          languages.find(l => l.value === selectedLanguage)?.label || selectedLanguage
        );
        
        const result = await pistonService.executeCode(pistonLanguage, code, input);
        
        let outputText = '✅ Code executed successfully!\n\n';
        
        if (result.run.stdout) {
          outputText += '📤 Output:\n' + result.run.stdout + '\n';
        }
        
        if (result.run.stderr) {
          outputText += '⚠️ Errors/Warnings:\n' + result.run.stderr + '\n';
        }
        
        if (result.run.code !== 0) {
          outputText += `❌ Exit code: ${result.run.code}\n`;
        }
        
        outputText += `\n🔧 Language: ${result.language} v${result.version}`;
        
        setOutput(outputText);
      }
    } catch (error) {
      console.error('Code execution error:', error);
      setOutput('❌ Execution Error: ' + (error as Error).message + '\n\n💡 Try asking the AI assistant for help!');
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
      const aiResponse = await geminiService.helpWithCode(code, selectedLanguage, question);
      
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
        content: 'Sorry, I encountered an error while processing your request. Please try again or check your internet connection.',
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950">
      {/* Header */}
      <div className="border-b bg-black/20 backdrop-blur-sm p-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={onBack} 
              className="border-white/20 text-white hover:bg-white/10 bg-white/5"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Terminal className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">CodeLab</h1>
                <p className="text-sm text-gray-300">Interactive Coding Environment • Powered by Piston API</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-full sm:w-48 bg-white/10 border-white/20 text-white">
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

            <div className="flex space-x-2 w-full sm:w-auto">
              <Button 
                onClick={runCode} 
                disabled={isRunning} 
                className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none"
              >
                {isRunning ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Run Code
              </Button>

              <Button 
                variant="outline" 
                onClick={() => setIsChatOpen(!isChatOpen)} 
                className="border-white/20 text-white hover:bg-white/10 bg-white/5"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">AI Assistant</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] gap-0">
        {/* Main Editor Area */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${isChatOpen ? 'lg:mr-2' : ''}`}>
          {/* Code Editor */}
          <div className="flex-1 p-4 pb-2">
            <Card className="h-full bg-black/40 border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <CardTitle className="flex items-center text-white">
                    <Code className="w-4 h-4 mr-2" />
                    Code Editor
                    <div className="ml-3 px-2 py-1 bg-blue-500/20 rounded text-xs text-blue-300">
                      {languages.find(l => l.value === selectedLanguage)?.label}
                    </div>
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={downloadCode} 
                      className="border-white/20 text-white hover:bg-white/10 bg-white/5 transition-all duration-200 hover:scale-105"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={saveToNotes} 
                      className="border-white/20 text-white hover:bg-white/10 bg-white/5 transition-all duration-200 hover:scale-105"
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-full">
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="h-full min-h-[300px] sm:min-h-[400px] font-mono text-sm border-0 resize-none focus:ring-0 bg-transparent text-white placeholder-gray-400 transition-all duration-200"
                  placeholder="Write your code here..."
                />
              </CardContent>
            </Card>
          </div>

          {/* Output Section */}
          <div className="h-48 sm:h-64 p-4 pt-0">
            <Card className="h-full bg-black/60 border-white/10 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white flex items-center">
                  <Terminal className="w-4 h-4 mr-2" />
                  Console Output
                  {isRunning && <Loader2 className="w-3 h-3 ml-2 animate-spin" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-full">
                <div className="h-full min-h-[100px] sm:min-h-[120px] p-4 bg-black/80 text-green-400 font-mono text-sm overflow-auto whitespace-pre-wrap">
                  {output || '🎯 Click "Run Code" to execute your program and see the output here...\n\n💡 Real code execution powered by Piston API\n- Supports multiple languages\n- Real-time compilation and execution\n- Secure sandboxed environment'}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Chat Sidebar */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.3 }}
              className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-white/10 bg-black/20 backdrop-blur-sm flex flex-col"
            >
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white flex items-center">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Coding Assistant
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsChatOpen(false)} 
                    className="text-white hover:bg-white/10 transition-all duration-200 hover:scale-105"
                  >
                    <ChevronRight className="w-4 h-4 lg:hidden" />
                    <span className="lg:hidden ml-1">Close</span>
                    <ChevronRight className="w-4 h-4 hidden lg:block" />
                  </Button>
                </div>
                <p className="text-sm text-gray-300 mt-2">
                  Ask questions about your code, get help with bugs, or learn new concepts.
                </p>
              </div>

              <div className="flex-1 overflow-auto p-4 space-y-4 max-h-64 lg:max-h-none">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-400">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm mb-4">Ask me anything about your code!</p>
                    <div className="space-y-2 text-xs">
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-2 bg-white/5 rounded text-left transition-all duration-200 hover:bg-white/10"
                      >
                        "How do I fix this error?"
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-2 bg-white/5 rounded text-left transition-all duration-200 hover:bg-white/10"
                      >
                        "Optimize this function"
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-2 bg-white/5 rounded text-left transition-all duration-200 hover:bg-white/10"
                      >
                        "Explain this concept"
                      </motion.div>
                    </div>
                  </div>
                ) : (
                  <AnimatePresence>
                    {chatMessages.map(message => (
                      <motion.div 
                        key={message.id} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className={`p-3 rounded-lg transition-all duration-200 hover:shadow-md ${
                          message.type === 'user' 
                            ? 'bg-blue-500/20 text-blue-100 ml-4' 
                            : 'bg-white/10 text-gray-100 mr-4'
                        }`}
                      >
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
                {isAskingAI && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white/10 p-3 rounded-lg mr-4"
                  >
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-gray-300">AI is analyzing your code...</span>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="p-4 border-t border-white/10">
                <div className="flex space-x-2">
                  <Textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about your code..."
                    className="min-h-[60px] resize-none bg-white/10 border-white/20 text-white placeholder-gray-400 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        askAI();
                      }
                    }}
                  />
                  <Button 
                    onClick={askAI} 
                    disabled={isAskingAI || !chatInput.trim()} 
                    className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 hover:scale-105"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CodeLab;
