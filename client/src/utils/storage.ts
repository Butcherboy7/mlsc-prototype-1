
import { StudyNote, Flashcard } from '@/types';

const STORAGE_KEYS = {
  NOTES: 'mentora_notes',
  FLASHCARDS: 'mentora_flashcards',
} as const;

export const storageUtils = {
  // Notes storage
  saveNotes: (notes: StudyNote[]) => {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  },

  loadNotes: (): StudyNote[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (!stored) return [];
      
      const notes = JSON.parse(stored);
      return notes.map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }));
    } catch (error) {
      console.error('Error loading notes:', error);
      return [];
    }
  },

  // Flashcards storage
  saveFlashcards: (flashcards: Flashcard[]) => {
    localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(flashcards));
  },

  loadFlashcards: (): Flashcard[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FLASHCARDS);
      if (!stored) return [];
      
      const flashcards = JSON.parse(stored);
      return flashcards.map((card: any) => ({
        ...card,
        createdAt: new Date(card.createdAt),
        updatedAt: new Date(card.updatedAt),
        nextReview: new Date(card.nextReview),
      }));
    } catch (error) {
      console.error('Error loading flashcards:', error);
      return [];
    }
  },
};
