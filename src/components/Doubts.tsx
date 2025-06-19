
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, Mic, MicOff, Volume2, HelpCircle } from 'lucide-react';

interface Doubt {
  id: string;
  question: string;
  answer?: string;
  subject: string;
  timestamp: Date;
  resolved: boolean;
}

const Doubts: React.FC = () => {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [newDoubt, setNewDoubt] = useState({ question: '', subject: '' });
  const [isListening, setIsListening] = useState(false);

  const handleSubmitDoubt = () => {
    if (!newDoubt.question.trim()) return;

    const doubt: Doubt = {
      id: crypto.randomUUID(),
      question: newDoubt.question,
      subject: newDoubt.subject || 'General',
      timestamp: new Date(),
      resolved: false
    };

    setDoubts(prev => [...prev, doubt]);
    setNewDoubt({ question: '', subject: '' });
  };

  const handleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      // Stop listening logic here
    } else {
      setIsListening(true);
      // Start listening logic here
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ask a Question</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <Input
              placeholder="e.g., Mathematics, Programming"
              value={newDoubt.subject}
              onChange={(e) => setNewDoubt(prev => ({ ...prev, subject: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Your Question</label>
            <div className="flex gap-2">
              <Textarea
                placeholder="What would you like to know?"
                value={newDoubt.question}
                onChange={(e) => setNewDoubt(prev => ({ ...prev, question: e.target.value }))}
                rows={3}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={handleVoiceInput}
                className={isListening ? "bg-red-50 border-red-200" : ""}
              >
                {isListening ? <MicOff className="w-4 h-4 text-red-600" /> : <Mic className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <Button onClick={handleSubmitDoubt} disabled={!newDoubt.question.trim()}>
            <Send className="w-4 h-4 mr-2" />
            Submit Question
          </Button>
        </CardContent>
      </Card>

      {doubts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No questions yet</h3>
            <p className="text-muted-foreground">
              Ask your first question to get started with learning
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {doubts.map(doubt => (
            <Card key={doubt.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{doubt.question}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{doubt.subject}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {doubt.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              {doubt.answer && (
                <CardContent>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm">{doubt.answer}</p>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Doubts;
