
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { StudyMode, DoubtThread } from '@/types';
import { HelpCircle, Send, MessageCircle, CheckCircle, Volume2, Mic, Lightbulb } from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { useVoice } from '@/hooks/useVoice';
import StudyModeSelector from './StudyModeSelector';

interface DoubtsProps {
  selectedMode: StudyMode;
  onModeChange: (mode: StudyMode) => void;
}

const Doubts: React.FC<DoubtsProps> = ({ selectedMode, onModeChange }) => {
  const [doubts, setDoubts] = useState<DoubtThread[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [selectedDoubt, setSelectedDoubt] = useState<DoubtThread | null>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState('');

  const { isLoading, answerQuestion, explainConcept } = useAI();
  const { transcript, isListening, startListening, stopListening, speak, resetTranscript } = useVoice();

  React.useEffect(() => {
    if (transcript) {
      if (selectedDoubt) {
        setFollowUpQuestion(prev => prev + ' ' + transcript);
      } else {
        setNewQuestion(prev => prev + ' ' + transcript);
      }
      resetTranscript();
    }
  }, [transcript, selectedDoubt, resetTranscript]);

  const handleAskQuestion = async () => {
    if (!newQuestion.trim()) return;

    const newDoubt: DoubtThread = {
      id: crypto.randomUUID(),
      question: newQuestion,
      followUps: [],
      mode: selectedMode,
      resolved: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setDoubts(prev => [newDoubt, ...prev]);
    setNewQuestion('');

    try {
      const response = await answerQuestion(newQuestion, selectedMode);
      
      setDoubts(prev => prev.map(doubt => 
        doubt.id === newDoubt.id 
          ? { ...doubt, answer: response.content, followUps: response.followUps || [] }
          : doubt
      ));
    } catch (error) {
      console.error('Error getting answer:', error);
    }
  };

  const handleFollowUp = async () => {
    if (!followUpQuestion.trim() || !selectedDoubt) return;

    const fullQuestion = `Follow-up to "${selectedDoubt.question}": ${followUpQuestion}`;
    
    try {
      const response = await explainConcept(fullQuestion, selectedMode);
      
      setDoubts(prev => prev.map(doubt => 
        doubt.id === selectedDoubt.id 
          ? { 
              ...doubt, 
              answer: doubt.answer + '\n\n**Follow-up:** ' + response.content,
              updatedAt: new Date()
            }
          : doubt
      ));
      
      setFollowUpQuestion('');
    } catch (error) {
      console.error('Error getting follow-up answer:', error);
    }
  };

  const markAsResolved = (doubtId: string) => {
    setDoubts(prev => prev.map(doubt => 
      doubt.id === doubtId ? { ...doubt, resolved: true } : doubt
    ));
  };

  const modeDoubts = doubts.filter(doubt => doubt.mode === selectedMode);
  const unresolvedDoubts = modeDoubts.filter(doubt => !doubt.resolved);

  const renderMarkdown = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="space-y-6">
      <StudyModeSelector selectedMode={selectedMode} onModeChange={onModeChange} />

      {/* Ask New Question */}
      <Card className="mentora-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Ask a Question
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder={`Ask any ${selectedMode} question...`}
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            rows={3}
          />
          
          <div className="flex gap-2">
            <Button 
              onClick={handleAskQuestion} 
              disabled={isLoading || !newQuestion.trim()}
            >
              <Send className="w-4 h-4 mr-2" />
              {isLoading ? 'Getting Answer...' : 'Ask Question'}
            </Button>
            
            <Button
              variant="outline"
              onClick={isListening ? stopListening : startListening}
            >
              <Mic className="w-4 h-4 mr-2" />
              {isListening ? 'Stop' : 'Voice Input'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Suggestions */}
      <Card className="mentora-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Quick Help for {selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {getQuickSuggestions(selectedMode).map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setNewQuestion(suggestion)}
                className="text-left justify-start h-auto p-3"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Doubt Threads */}
      <div className="space-y-4">
        {modeDoubts.map(doubt => (
          <Card key={doubt.id} className={`mentora-card ${doubt.resolved ? 'bg-green-50 border-green-200' : ''}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{doubt.question}</CardTitle>
                <div className="flex items-center gap-2">
                  {doubt.resolved && (
                    <Badge variant="outline" className="text-green-600 border-green-400">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Resolved
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speak(doubt.answer || doubt.question)}
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(doubt.createdAt).toLocaleString()}
              </p>
            </CardHeader>
            
            {doubt.answer && (
              <CardContent className="space-y-4">
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(doubt.answer) }}
                />

                {/* Follow-up Questions */}
                {doubt.followUps && doubt.followUps.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Suggested follow-ups:</h4>
                    <div className="grid grid-cols-1 gap-1">
                      {doubt.followUps.map((followUp, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          onClick={() => setNewQuestion(followUp)}
                          className="text-left justify-start h-auto p-2 text-xs"
                        >
                          {followUp}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Follow-up Input */}
                {selectedDoubt?.id === doubt.id ? (
                  <div className="space-y-2 pt-4 border-t">
                    <Textarea
                      placeholder="Ask a follow-up question..."
                      value={followUpQuestion}
                      onChange={(e) => setFollowUpQuestion(e.target.value)}
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleFollowUp} disabled={!followUpQuestion.trim()}>
                        Ask Follow-up
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setSelectedDoubt(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedDoubt(doubt)}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Follow-up
                    </Button>
                    
                    {!doubt.resolved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsResolved(doubt.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {modeDoubts.length === 0 && (
        <Card className="mentora-card">
          <CardContent className="text-center py-8">
            <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No questions yet</h3>
            <p className="text-muted-foreground mb-4">
              Ask your first {selectedMode} question to get instant AI help
            </p>
            <Button onClick={() => setNewQuestion(getQuickSuggestions(selectedMode)[0])}>
              Try a Sample Question
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {unresolvedDoubts.length > 0 && (
        <Card className="mentora-card border-yellow-200 bg-yellow-50">
          <CardContent className="text-center py-4">
            <p className="text-yellow-800">
              You have {unresolvedDoubts.length} unresolved question{unresolvedDoubts.length !== 1 ? 's' : ''} in {selectedMode}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

function getQuickSuggestions(mode: StudyMode): string[] {
  const suggestions = {
    maths: [
      'How do I solve quadratic equations?',
      'Explain the concept of derivatives',
      'What is the difference between mean and median?',
      'How do I calculate compound interest?'
    ],
    coding: [
      'What is the difference between == and === in JavaScript?',
      'How does recursion work?',
      'Explain object-oriented programming',
      'What are the best practices for naming variables?'
    ],
    business: [
      'What is a SWOT analysis?',
      'How do you calculate ROI?',
      'Explain the concept of market segmentation',
      'What are the 4 Ps of marketing?'
    ],
    law: [
      'What is the difference between criminal and civil law?',
      'Explain the concept of precedent',
      'What are the elements of a contract?',
      'How does the appeals process work?'
    ],
    literature: [
      'What is symbolism in literature?',
      'How do you analyze character development?',
      'Explain different narrative perspectives',
      'What are literary devices and how are they used?'
    ]
  };

  return suggestions[mode] || [];
}

export default Doubts;
