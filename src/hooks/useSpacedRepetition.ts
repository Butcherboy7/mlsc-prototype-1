
import { useState, useCallback } from 'react';
import { Flashcard } from '@/types';

const INTERVALS = {
  easy: [1, 6, 13, 30, 90], // days
  medium: [1, 3, 7, 21, 60],
  hard: [1, 1, 3, 10, 30]
};

export const useSpacedRepetition = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  const calculateNextReview = useCallback((difficulty: 'easy' | 'medium' | 'hard', reviewCount: number): Date => {
    const intervals = INTERVALS[difficulty];
    const intervalIndex = Math.min(reviewCount, intervals.length - 1);
    const days = intervals[intervalIndex];
    
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + days);
    return nextReview;
  }, []);

  const updateCardDifficulty = useCallback((cardId: string, difficulty: 'easy' | 'medium' | 'hard') => {
    setFlashcards(prev => prev.map(card => {
      if (card.id === cardId) {
        const newReviewCount = card.reviewCount + 1;
        const nextReview = calculateNextReview(difficulty, newReviewCount);
        const newStreak = difficulty === 'easy' ? card.streak + 1 : 0;
        
        return {
          ...card,
          difficulty,
          reviewCount: newReviewCount,
          nextReview,
          streak: newStreak,
          updatedAt: new Date()
        };
      }
      return card;
    }));
  }, [calculateNextReview]);

  const getDueCards = useCallback((): Flashcard[] => {
    const now = new Date();
    return flashcards.filter(card => card.nextReview <= now);
  }, [flashcards]);

  const addFlashcard = useCallback((card: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt' | 'nextReview' | 'reviewCount' | 'streak'>) => {
    const newCard: Flashcard = {
      ...card,
      id: crypto.randomUUID(),
      nextReview: new Date(),
      reviewCount: 0,
      streak: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setFlashcards(prev => [...prev, newCard]);
    return newCard;
  }, []);

  const updateFlashcard = useCallback((cardId: string, updates: Partial<Flashcard>) => {
    setFlashcards(prev => prev.map(card => 
      card.id === cardId 
        ? { ...card, ...updates, updatedAt: new Date() }
        : card
    ));
  }, []);

  const deleteFlashcard = useCallback((cardId: string) => {
    setFlashcards(prev => prev.filter(card => card.id !== cardId));
  }, []);

  return {
    flashcards,
    setFlashcards,
    getDueCards,
    addFlashcard,
    updateFlashcard,
    deleteFlashcard,
    updateCardDifficulty
  };
};
