export type MasteryStatus = 'mastered' | 'learning' | 'unseen';

export interface TermItem {
  id: string;
  term: string;
  definition: string;
  category: 'Cellular Respiration' | 'Cell Structures' | 'Membrane Transport' | 'Energy & Photosynthesis';
  status: MasteryStatus;
  starred?: boolean;
  mnemonic?: string;
  keyFact?: string;
}

export type StudyMode = 'overview' | 'flashcards' | 'learn' | 'test' | 'match' | 'qchat';

export interface TestQuestion {
  id: string;
  termId: string;
  type: 'multiple-choice' | 'true-false' | 'written';
  prompt: string;
  correctAnswer: string;
  options?: string[];
  userAnswer?: string;
  isCorrect?: boolean;
  explanation: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedQuestions?: string[];
}
