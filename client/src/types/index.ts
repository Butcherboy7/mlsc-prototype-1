
export type StudyMode = 'maths' | 'coding' | 'business' | 'law' | 'literature';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  nextReview: Date;
  reviewCount: number;
  streak: number;
  mode: StudyMode;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyNote {
  id: string;
  title: string;
  content: string;
  summary: string;
  mode: StudyMode;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DoubtThread {
  id: string;
  question: string;
  answer?: string;
  followUps: string[];
  mode: StudyMode;
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyPlan {
  id: string;
  title: string;
  description: string;
  mode: StudyMode;
  totalDays: number;
  currentDay: number;
  topics: StudyTopic[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyTopic {
  id: string;
  name: string;
  description: string;
  estimatedHours: number;
  completed: boolean;
  day: number;
}

export interface ConfusionPoint {
  topic: string;
  confidence: number;
  suggestions: string[];
  timestamp: Date;
}

export interface VoiceSettings {
  enabled: boolean;
  language: string;
  rate: number;
  pitch: number;
  volume: number;
}
