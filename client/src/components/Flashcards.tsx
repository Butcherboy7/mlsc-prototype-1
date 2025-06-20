import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StudyMode, Flashcard } from '@/types';
import { Brain, Plus, RotateCcw, Check, X, Edit, Save, Filter, Calendar, ArrowLeft } from 'lucide-react';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { storageUtils } from '@/utils/storage';

interface FlashcardsProps {
  onBack: () => void;
}

const Flashcards: React.FC<FlashcardsProps> = ({ onBack }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isStudying, setIsStudying] = useState(false);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [newCard, setNewCard] = useState({ question: '', answer: '', reviewDate: '' });
  const [studySession, setStudySession] = useState<{ cards: Flashcard[], completed: number }>({ cards: [], completed: 0 });
  const [showReviewSection, setShowReviewSection] = useState(false);
  const [editForm, setEditForm] = useState({ question: '', answer: '', reviewDate: '' });

  const { flashcards, getDueCards, addFlashcard, updateCardDifficulty, deleteFlashcard, updateFlashcard, setFlashcards } = useSpacedRepetition();

  const dueCards = getDueCards();

  useEffect(() => {
    const loadedFlashcards = storageUtils.loadFlashcards();
    setFlashcards(loadedFlashcards);
  }, [setFlashcards]);

  useEffect(() => {
    storageUtils.saveFlashcards(flashcards);
  }, [flashcards]);

  const handleCreateCard = () => {
    if (!newCard.question || !newCard.answer) return;

    const reviewDate = newCard.reviewDate ? new Date(newCard.reviewDate) : new Date();

    const card = addFlashcard({
      question: newCard.question,
      answer: newCard.answer,
      difficulty: 'medium',
      mode: 'maths'
    });

    if (newCard.reviewDate) {
      updateFlashcard(card.id, { nextReview: reviewDate });
    }

    setNewCard({ question: '', answer: '', reviewDate: '' });
    setIsCreating(false);
  };

  const handleEditCard = (card: Flashcard) => {
    setEditingCard(card.id);
    setEditForm({ 
      question: card.question, 
      answer: card.answer,
      reviewDate: card.nextReview.toISOString().split('T')[0]
    });
  };

  const handleSaveEdit = (cardId: string) => {
    const reviewDate = editForm.reviewDate ? new Date(editForm.reviewDate) : undefined;
    
    updateFlashcard(cardId, {
      question: editForm.question,
      answer: editForm.answer,
      ...(reviewDate && { nextReview: reviewDate })
    });
    setEditingCard(null);
    setEditForm({ question: '', answer: '', reviewDate: '' });
  };

  const startStudySession = () => {
    if (dueCards.length === 0) return;
    
    setStudySession({ cards: [...dueCards], completed: 0 });
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setIsStudying(true);
  };

  const handleCardResponse = (difficulty: 'easy' | 'medium' | 'hard') => {
    const currentCard = studySession.cards[currentCardIndex];
    updateCardDifficulty(currentCard.id, difficulty);
    
    const newCompleted = studySession.completed + 1;
    setStudySession(prev => ({ ...prev, completed: newCompleted }));
    
    if (newCompleted >= studySession.cards.length) {
      setIsStudying(false);
      setStudySession({ cards: [], completed: 0 });
    } else {
      setCurrentCardIndex(prev => prev + 1);
      setShowAnswer(false);
    }
  };

  const addFlashcardFromExternal = (question: string, answer: string) => {
    addFlashcard({
      question,
      answer,
      difficulty: 'medium',
      mode: 'maths'
    });
  };

  React.useEffect(() => {
    (window as any).addFlashcardFromAIChat = addFlashcardFromExternal;
  }, []);

  const currentCard = isStudying ? studySession.cards[currentCardIndex] : null;
  const sessionProgress = isStudying ? (studySession.completed / studySession.cards.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="text-center">
          <h1 className="text-3xl font-bold">Flashcards</h1>
          <p className="text-muted-foreground">Spaced repetition learning system</p>
        </div>
        <div></div>
      </div>

      {/* Study Session */}
      {isStudying && currentCard && (
        <Card className="mentora-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Study Session</CardTitle>
              <Badge variant="outline">
                {studySession.completed + 1} of {studySession.cards.length}
              </Badge>
            </div>
            <Progress value={sessionProgress} className="w-full" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="min-h-[120px] flex items-center justify-center p-6 bg-muted rounded-lg">
                <p className="text-lg text-center leading-relaxed">{currentCard.question}</p>
              </div>

              {showAnswer ? (
                <div className="space-y-4">
                  <div className="min-h-[120px] flex items-center justify-center p-6 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-lg text-center leading-relaxed">{currentCard.answer}</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-2xl mx-auto">
                    <Button
                      onClick={() => handleCardResponse('hard')}
                      className="flex-1 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800 min-h-[60px]"
                      variant="outline"
                    >
                      <X className="w-4 h-4 mr-2" />
                      <div className="text-center">
                        <div className="font-medium">Hard</div>
                        <div className="text-xs opacity-75">Review in 1 day</div>
                      </div>
                    </Button>
                    <Button
                      onClick={() => handleCardResponse('medium')}
                      className="flex-1 bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100 hover:text-yellow-800 min-h-[60px]"
                      variant="outline"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      <div className="text-center">
                        <div className="font-medium">Medium</div>
                        <div className="text-xs opacity-75">Review in 3 days</div>
                      </div>
                    </Button>
                    <Button
                      onClick={() => handleCardResponse('easy')}
                      className="flex-1 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800 min-h-[60px]"
                      variant="outline"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      <div className="text-center">
                        <div className="font-medium">Easy</div>
                        <div className="text-xs opacity-75">Review in 6 days</div>
                      </div>
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => setShowAnswer(true)} size="lg" className="min-h-[50px] px-8">
                  Show Answer
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Card */}
      {isCreating && (
        <Card className="mentora-card">
          <CardHeader>
            <CardTitle>Create New Flashcard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Question</label>
              <Textarea
                placeholder="Enter the question"
                value={newCard.question}
                onChange={(e) => setNewCard(prev => ({ ...prev, question: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Answer</label>
              <Textarea
                placeholder="Enter the answer"
                value={newCard.answer}
                onChange={(e) => setNewCard(prev => ({ ...prev, answer: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Review Date (Optional)</label>
              <Input
                type="date"
                value={newCard.reviewDate}
                onChange={(e) => setNewCard(prev => ({ ...prev, reviewDate: e.target.value }))}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateCard} disabled={!newCard.question || !newCard.answer}>
                Create Card
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreating(false);
                  setNewCard({ question: '', answer: '', reviewDate: '' });
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {!isStudying && !isCreating && (
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={startStudySession} disabled={dueCards.length === 0}>
            <Brain className="w-4 h-4 mr-2" />
            Study Due Cards ({dueCards.length})
          </Button>
          
          <Button variant="outline" onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Flashcard
          </Button>

          <Button 
            variant="outline" 
            onClick={() => setShowReviewSection(!showReviewSection)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {showReviewSection ? 'Hide' : 'Show'} All Cards ({flashcards.length})
          </Button>
        </div>
      )}

      {/* Cards Overview */}
      {!isStudying && !isCreating && showReviewSection && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {flashcards.map(card => (
            <Card key={card.id} className="mentora-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm line-clamp-2 flex-1">{card.question}</CardTitle>
                  <div className="flex gap-1 ml-2">
                    <Badge 
                      variant="outline" 
                      className={
                        card.difficulty === 'easy' ? 'bg-green-50 border-green-200 text-green-700' :
                        card.difficulty === 'medium' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                        'bg-red-50 border-red-200 text-red-700'
                      }
                    >
                      {card.difficulty}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingCard === card.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editForm.question}
                      onChange={(e) => setEditForm(prev => ({ ...prev, question: e.target.value }))}
                      rows={2}
                      className="text-sm"
                    />
                    <Textarea
                      value={editForm.answer}
                      onChange={(e) => setEditForm(prev => ({ ...prev, answer: e.target.value }))}
                      rows={2}
                      className="text-sm"
                    />
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Review Date</label>
                      <Input
                        type="date"
                        value={editForm.reviewDate}
                        onChange={(e) => setEditForm(prev => ({ ...prev, reviewDate: e.target.value }))}
                        className="text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleSaveEdit(card.id)}
                        disabled={!editForm.question || !editForm.answer}
                      >
                        <Save className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setEditingCard(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {card.answer}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span>Streak: {card.streak}</span>
                      <span>Reviews: {card.reviewCount}</span>
                    </div>
                    
                    <div className="mb-3 text-xs text-muted-foreground">
                      Next review: {new Date(card.nextReview).toLocaleDateString()}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCard(card)}
                        className="flex-1"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteFlashcard(card.id)}
                        className="flex-1 text-destructive hover:text-destructive"
                      >
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {flashcards.length === 0 && !isCreating && !isStudying && (
        <Card className="mentora-card">
          <CardContent className="text-center py-8">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No flashcards yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first flashcard or generate them from AI Chat
            </p>
            <Button onClick={() => setIsCreating(true)}>
              Create Flashcard
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Flashcards;
