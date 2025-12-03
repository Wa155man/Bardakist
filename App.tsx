
import React, { useState, useEffect } from 'react';
import { LevelMap } from './components/LevelMap';
import { TopBar } from './components/TopBar';
import { MiniGame } from './components/MiniGame';
import { Button } from './components/Button';
import { TutorialOverlay, TutorialStep } from './components/TutorialOverlay';
import { TongueTwisters } from './components/TongueTwisters';
import { SettingsModal } from './components/SettingsModal';
import { SnowmanGame } from './components/SnowmanGame';
import { MiniPracticeGrid } from './components/MiniPracticeGrid';
import { MatchingGame } from './components/MatchingGame';
import { NamingGame } from './components/NamingGame';
import { MemoryGame } from './components/MemoryGame';
import { HangmanGame } from './components/HangmanGame';
import { RhymeGame } from './components/RhymeGame';
import { ReadingGame } from './components/ReadingGame';
import { WritingGame } from './components/WritingGame';
import { DictationGame } from './components/DictationGame';
import { FontControl } from './components/FontControl';
import { RewardOverlay } from './components/RewardOverlay'; 
import { PetSelection } from './components/PetSelection'; 
import { ScreenState, LevelNode, UserProgress, GameQuestion, AppSettings, SentenceQuestion, RhymeQuestion, ReadingQuestion, GuriReward, PetProfile } from './types';
import { generateLevelContent, generateSentenceQuestions, generateHangmanWords, generateRhymeQuestions, generateReadingQuestions, getMiniGameImageUrl, getHangmanImageUrl } from './services/geminiService';
import { LEVEL_NODES, GURI_REWARDS, PETS } from './constants';

export const App: React.FC = () => {
  // ... existing states ...
  const [screen, setScreen] = useState<ScreenState>(ScreenState.LEVEL_SELECT);
  const [returnScreen, setReturnScreen] = useState<ScreenState>(ScreenState.LEVEL_SELECT);
  const [currentLevel, setCurrentLevel] = useState<LevelNode | null>(null);
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [sentenceQuestions, setSentenceQuestions] = useState<SentenceQuestion[]>([]);
  const [hangmanWords, setHangmanWords] = useState<{word: string, hint: string, hebrewHint: string, imagePrompt: string}[]>([]);
  const [hangmanHistory, setHangmanHistory] = useState<Set<string>>(new Set());
  
  // ... (Rest of existing history states) ...
  const [rhymeQuestions, setRhymeQuestions] = useState<RhymeQuestion[]>([]);
  const [rhymeHistory, setRhymeHistory] = useState<Set<string>>(new Set());
  const [isLoadingRhymes, setIsLoadingRhymes] = useState(false);

  const [readingQuestions, setReadingQuestions] = useState<ReadingQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [snowmanLanguage, setSnowmanLanguage] = useState<'hebrew' | 'english'>('hebrew');
  const [currentReward, setCurrentReward] = useState<GuriReward | null>(null);

  // ... (History logic) ...
  const [sentenceHistory, setSentenceHistory] = useState<Set<string>>(() => {
      try {
          const saved = localStorage.getItem('sentenceHistory');
          return saved ? new Set(JSON.parse(saved)) : new Set();
      } catch (e) {
          console.error("Failed to load sentence history", e);
          return new Set();
      }
  });

  useEffect(() => {
      localStorage.setItem('sentenceHistory', JSON.stringify(Array.from(sentenceHistory)));
  }, [sentenceHistory]);

  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    try {
        const saved = localStorage.getItem('userProgress');
        return saved ? JSON.parse(saved) : { totalCoins: 0, completedLevels: [] };
    } catch (e) {
        console.error("Failed to load user progress", e);
        return { totalCoins: 0, completedLevels: [] };
    }
  });
  
  // ... (User progress effect & handleResetScore) ...
  useEffect(() => {
    localStorage.setItem('userProgress', JSON.stringify(userProgress));
  }, [userProgress]);

  const handleResetScore = () => {
      setUserProgress(prev => ({ ...prev, totalCoins: 0 }));
  };

  // ... (Settings and Pet Selection Logic - unchanged) ...
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('appSettings');
    const defaults: AppSettings = { 
      childName: 'Tommy', 
      soundEffects: true, 
      autoPlayAudio: true,
      fontStyle: 'print',
      selectedPetId: 'guri' 
    };
    if (!saved) return defaults;
    try {
        const parsed = JSON.parse(saved);
        const merged = { ...defaults, ...parsed };
        if (merged.fontStyle === 'marker') merged.fontStyle = 'playpen';
        return merged;
    } catch (e) { return defaults; }
  });

  const handleEarnPoints = (amount: number) => {
    setUserProgress(prev => {
      const newTotal = prev.totalCoins + amount;
      const oldMilestone = Math.floor(prev.totalCoins / 100);
      const newMilestone = Math.floor(newTotal / 100);
      
      if (newMilestone > oldMilestone && newMilestone > 0) {
          const milestoneTarget = newMilestone * 100;
          const currentPet = PETS.find(p => p.id === settings.selectedPetId) || PETS[0];
          const rewardsList = currentPet.rewards || GURI_REWARDS;
          const rewardIndex = (newMilestone - 1) % rewardsList.length;
          const reward = rewardsList[rewardIndex];
          setTimeout(() => {
             setCurrentReward({ ...reward, milestone: milestoneTarget });
          }, 500);
      }
      return { ...prev, totalCoins: newTotal };
    });
  };

  // ... (useEffect for pet selection redirect - unchanged) ...
  useEffect(() => {
      const hasSelectedPet = localStorage.getItem('has_selected_pet');
      if (!hasSelectedPet) setScreen(ScreenState.PET_SELECTION);
  }, []);

  const getSelectedPet = (): PetProfile => {
      return PETS.find(p => p.id === settings.selectedPetId) || PETS[0];
  };

  const handlePetSelection = (petId: string) => {
      handleSaveSettings({ ...settings, selectedPetId: petId });
      localStorage.setItem('has_selected_pet', 'true');
      setScreen(ScreenState.LEVEL_SELECT);
      const hasSeenMapTutorial = localStorage.getItem('tutorial_map_completed');
      if (!hasSeenMapTutorial) {
        setTimeout(() => {
            const pet = PETS.find(p => p.id === petId) || PETS[0];
            startTutorial([
                { message: `שלום! אני ${pet.nameHebrew}. ברוכים הבאים להרפתקאות בעברית!` },
                { message: "טיילו בשביל האבנים הצהובות כדי לפתוח שלבים ולהרוויח מטבעות." },
                { message: "לחצו על השלב הראשון כדי להתחיל במסע!" }
            ]);
            localStorage.setItem('tutorial_map_completed', 'true');
        }, 500);
      }
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
  };
  
  const handleLoadProgress = (newProgress: UserProgress) => {
    setUserProgress(newProgress);
    localStorage.setItem('userProgress', JSON.stringify(newProgress));
  };

  useEffect(() => {
    const root = document.documentElement;
    let fontVal = "'Varela Round', sans-serif"; 
    if (settings.fontStyle === 'hand1') fontVal = "'Gveret Levin', cursive"; 
    if (settings.fontStyle === 'playpen') fontVal = "'Playpen Sans Hebrew', cursive"; 
    if (settings.fontStyle === 'alef') fontVal = "'Alef', sans-serif";
    root.style.setProperty('--dynamic-font', fontVal);
  }, [settings.fontStyle]);

  const handleResetProgress = () => {
    const resetProgress = { totalCoins: 0, completedLevels: [] };
    setUserProgress(resetProgress);
    localStorage.setItem('userProgress', JSON.stringify(resetProgress));
    // Clear keys
    localStorage.removeItem('sentenceHistory');
    localStorage.removeItem('hangmanHistory');
    localStorage.removeItem('rhymeHistory');
    localStorage.removeItem('has_selected_pet');
    localStorage.removeItem('tutorial_map_completed');
    // ... remove other keys ...
    location.reload();
  };

  // ... (Tutorial logic - unchanged) ...
  const [tutorialActive, setTutorialActive] = useState(false);
  const [tutorialSteps, setTutorialSteps] = useState<TutorialStep[]>([]);
  const [tutorialStepIndex, setTutorialStepIndex] = useState(0);

  useEffect(() => {
    const hasSeenMapTutorial = localStorage.getItem('tutorial_map_completed');
    const hasSelectedPet = localStorage.getItem('has_selected_pet');
    if (!hasSeenMapTutorial && hasSelectedPet) {
      const pet = getSelectedPet();
      startTutorial([
        { message: `שלום! אני ${pet.nameHebrew}. ברוכים הבאים להרפתקאות בעברית!` },
        { message: "טיילו בשביל האבנים הצהובות כדי לפתוח שלבים ולהרוויח מטבעות." },
        { message: "לחצו על השלב הראשון כדי להתחיל במסע!" }
      ]);
      localStorage.setItem('tutorial_map_completed', 'true');
    }
  }, []);

  const startTutorial = (steps: TutorialStep[]) => {
    setTutorialSteps(steps);
    setTutorialStepIndex(0);
    setTutorialActive(true);
  };

  const handleTutorialNext = () => {
    if (tutorialStepIndex < tutorialSteps.length - 1) {
      setTutorialStepIndex(prev => prev + 1);
    } else {
      setTutorialActive(false);
    }
  };

  const handleSelectLevel = async (level: LevelNode) => {
    // ... (Existing Level Logic) ...
    setCurrentLevel(level);
    setIsLoading(true);
    setScreen(ScreenState.GAME_SESSION); 
    try {
      const generatedQuestions = await generateLevelContent(level.vowel);
      setQuestions(generatedQuestions);
      setCurrentQuestionIndex(0);
      if (generatedQuestions.length > 0) {
          // Preload images
          const imgPromise = new Promise<void>((resolve) => {
              const firstImg = new Image();
              firstImg.onload = () => resolve();
              firstImg.onerror = () => resolve();
              firstImg.src = getMiniGameImageUrl(generatedQuestions[0].correctTranslation);
          });
          const timeoutPromise = new Promise<void>((resolve) => setTimeout(resolve, 1000));
          await Promise.race([imgPromise, timeoutPromise]);
          generatedQuestions.slice(1).forEach(q => {
            const img = new Image();
            img.src = getMiniGameImageUrl(q.correctTranslation);
          });
      }
      // Tutorial check
      const hasSeenGameTutorial = localStorage.getItem('tutorial_game_completed');
      if (!hasSeenGameTutorial) {
        setTimeout(() => {
          startTutorial([
            { message: "הנה האתגר הראשון שלכם!" },
            { message: "לחצו על המילה הגדולה כדי לשמוע איך אומרים אותה." },
            { message: "לאחר מכן, בחרו את התרגום הנכון באנגלית מהכפתורים למטה." }
          