
export enum ScreenState {
  HOME = 'HOME',
  LEVEL_SELECT = 'LEVEL_SELECT', // The "Map" view
  LEVEL_DETAIL = 'LEVEL_DETAIL', // Inside a specific vowel zone
  GAME_SESSION = 'GAME_SESSION',
  VICTORY = 'VICTORY',
  TONGUE_TWISTERS = 'TONGUE_TWISTERS',
  SNOWMAN_GAME = 'SNOWMAN_GAME',
  MINI_PRACTICE_SELECT = 'MINI_PRACTICE_SELECT',
  MATCHING_GAME = 'MATCHING_GAME',
  NAMING_GAME = 'NAMING_GAME',
  MEMORY_GAME = 'MEMORY_GAME',
  HANGMAN_GAME = 'HANGMAN_GAME',
  RHYME_GAME = 'RHYME_GAME',
  READING_GAME = 'READING_GAME',
  WRITING_GAME = 'WRITING_GAME',
  DICTATION_GAME = 'DICTATION_GAME',
  PET_SELECTION = 'PET_SELECTION' // New Screen
}

export enum VowelType {
  KAMATZ = 'Kamatz',
  PATACH = 'Patach',
  CHIRIK = 'Chirik',
  SEGOL = 'Segol',
  SHURUK = 'Shuruk',
  CHOLAM = 'Cholam'
}

export interface LevelNode {
  id: string;
  name: string;
  vowel: VowelType;
  description: string;
  x: number; // Percentage position on map
  y: number; // Percentage position on map
  color: string;
  unlocked: boolean;
  stars: number; // 0-3
}

export interface GameQuestion {
  id: string;
  word: string; // Hebrew word with Nikud
  correctTranslation: string;
  distractors: string[]; // Wrong translations
  imagePrompt: string; // For placeholder image generation
  hebrewHint?: string;
}

export interface SentenceQuestion {
  id: string;
  fullSentence: string; // "The boy ate an apple"
  sentenceWithBlank: string; // "The boy ___ an apple"
  missingWord: string; // "ate"
  distractors: string[]; // ["slept", "ran"]
  translation: string; // English translation
}

export interface RhymeQuestion {
  id: string;
  targetWord: string; 
  rhymeWord: string;
  distractors: string[];
  hint: string; // English hint
}

export interface ReadingQuestion {
  id: string;
  passage: string; // 3 sentences
  question: string;
  options: string[]; // 4 options
  correctAnswer: string;
}

export interface UserProgress {
  totalCoins: number;
  completedLevels: string[];
}

export interface AppSettings {
  childName: string;
  soundEffects: boolean;
  autoPlayAudio: boolean;
  fontStyle: 'print' | 'hand1' | 'playpen' | 'alef';
  selectedPetId: string; // New: Track selected pet
}

export interface HebrewLetter {
  char: string;
  name: string;
  nameHebrew: string;
}

export interface GuriReward {
  milestone: number;
  message: string;
  imagePrompt: string;
}

export interface PetProfile {
  id: string;
  name: string;
  nameHebrew: string;
  description: string;
  imagePrompt: string;
  voiceConfig: {
    pitch: number;
    rate: number;
    soundEffect: string; // e.g. "Hav Hav", "Squawk"
  };
  rewards?: GuriReward[];
}
