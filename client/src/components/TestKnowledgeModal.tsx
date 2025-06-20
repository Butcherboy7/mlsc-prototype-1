import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Eye, EyeOff, Trophy, BookOpen } from 'lucide-react';
import { geminiService } from '@/lib/gemini';

interface Question {
  id: number;
  question: string;
  userAnswer: string;
  isAnswered: boolean;
}

interface TestKnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalContent: string;
  mode: string;
}

const TestKnowledgeModal: React.FC<TestKnowledgeModalProps> = ({
  isOpen,
  onClose,
  originalContent,
  mode
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [showOriginalContent, setShowOriginalContent] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [feedback, setFeedback] = useState<string>('');

  useEffect(() => {
    if (isOpen && originalContent) {
      generateQuestions();
    }
  }, [isOpen, originalContent]);

  const generateQuestions = async () => {
    setIsGeneratingQuestions(true);
    try {
      const prompt = `Based on this content, generate exactly 3 short, focused questions to test understanding. Return only the questions, numbered 1-3, one per line:

${originalContent}`;

      const response = await geminiService.contextualChat(prompt, mode, 'test-knowledge');
      const questionLines = response.split('\n').filter(line => line.trim());
      
      const generatedQuestions: Question[] = questionLines.slice(0, 3).map((line, index) => ({
        id: index + 1,
        question: line.replace(/^\d+\.?\s*/, '').trim(),
        userAnswer: '',
        isAnswered: false
      }));

      setQuestions(generatedQuestions);
    } catch (error) {
      console.error('Failed to generate questions:', error);
      // Fallback questions
      setQuestions([
        { id: 1, question: 'What are the main points from this explanation?', userAnswer: '', isAnswered: false },
        { id: 2, question: 'How would you apply this concept?', userAnswer: '', isAnswered: false },
        { id: 3, question: 'What questions do you still have?', userAnswer: '', isAnswered: false }
      ]);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleAnswerChange = (value: string) => {
    setQuestions(prev => prev.map(q => 
      q.id === questions[currentQuestionIndex].id 
        ? { ...q, userAnswer: value }
        : q
    ));
  };

  const handleNextQuestion = () => {
    setQuestions(prev => prev.map(q => 
      q.id === questions[currentQuestionIndex].id 
        ? { ...q, isAnswered: true }
        : q
    ));

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      completeTest();
    }
  };

  const completeTest = async () => {
    setIsComplete(true);
    
    // Generate feedback based on answers
    try {
      const answersText = questions.map((q, i) => 
        `Q${i + 1}: ${q.question}\nA${i + 1}: ${q.userAnswer}`
      ).join('\n\n');

      const feedbackPrompt = `Based on these question-answer pairs about the original content, provide encouraging feedback and suggestions for improvement:

Original Content:
${originalContent}

User's Answers:
${answersText}

Provide brief, constructive feedback focusing on what they understood well and areas for improvement.`;

      const feedbackResponse = await geminiService.contextualChat(feedbackPrompt, mode, 'feedback');
      setFeedback(feedbackResponse);
    } catch (error) {
      setFeedback('Great job completing the knowledge test! Keep practicing to reinforce your understanding.');
    }
  };

  const resetTest = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setIsComplete(false);
    setShowOriginalContent(false);
    setFeedback('');
    onClose();
  };

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = questions.filter(q => q.isAnswered).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="test-knowledge-description">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <span>Test Your Knowledge</span>
            {questions.length > 0 && (
              <Badge variant="secondary">
                {answeredCount}/{questions.length}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        <div id="test-knowledge-description" className="sr-only">
          Interactive quiz to test your understanding of the AI response content
        </div>

        <div className="space-y-6">
          {isGeneratingQuestions && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Generating questions...</p>
            </div>
          )}

          {!isGeneratingQuestions && !isComplete && currentQuestion && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowOriginalContent(!showOriginalContent)}
                  className="flex items-center space-x-1"
                >
                  {showOriginalContent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{showOriginalContent ? 'Hide' : 'Show'} Original</span>
                </Button>
              </div>

              {showOriginalContent && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="text-sm whitespace-pre-wrap blur-sm hover:blur-none transition-all duration-300">
                      {originalContent}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="p-6">
                  <h4 className="font-medium mb-4">{currentQuestion.question}</h4>
                  <Textarea
                    value={currentQuestion.userAnswer}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder="Type your answer here..."
                    className="min-h-[120px]"
                  />
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={resetTest}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleNextQuestion}
                  disabled={!currentQuestion.userAnswer.trim()}
                  className="flex items-center space-x-2"
                >
                  <span>
                    {currentQuestionIndex === questions.length - 1 ? 'Complete Test' : 'Next Question'}
                  </span>
                  <CheckCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {isComplete && (
            <div className="space-y-6">
              <div className="text-center">
                <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Test Complete!</h3>
                <p className="text-muted-foreground">You answered all {questions.length} questions.</p>
              </div>

              {feedback && (
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-medium mb-3">Feedback</h4>
                    <div className="text-sm whitespace-pre-wrap">{feedback}</div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                <h4 className="font-medium">Your Answers:</h4>
                {questions.map((q, index) => (
                  <Card key={q.id} className="bg-muted/30">
                    <CardContent className="p-4">
                      <p className="font-medium text-sm mb-2">Q{index + 1}: {q.question}</p>
                      <p className="text-sm text-muted-foreground">{q.userAnswer || 'No answer provided'}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setShowOriginalContent(!showOriginalContent)}>
                  {showOriginalContent ? 'Hide' : 'Show'} Original Content
                </Button>
                <Button onClick={resetTest}>
                  Close
                </Button>
              </div>

              {showOriginalContent && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3">Original Content</h4>
                    <div className="text-sm whitespace-pre-wrap">{originalContent}</div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestKnowledgeModal;