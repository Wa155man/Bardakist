
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
import { generateLevelContent, generateSentenceQuestions, generateHangmanWords, generateRhymeQuestions, generateReadingQuestions, getMiniGameImageUrl, getHangmanImageUrl, resumeAudioContext, prefetchImage } from './services/geminiService';
import { LEVEL_NODES, GURI_REWARDS, PETS } from './constants';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenState>(ScreenState.LEVEL_SELECT);
  const [returnScreen, setReturnScreen] = useState<ScreenState>(ScreenState.LEVEL_SELECT);
  const [currentLevel, setCurrentLevel] = useState<LevelNode | null>(null);
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [nextQuestion, setNextQuestion] = useState<GameQuestion | undefined>(undefined);
  
  // Track words used in current session to prevent repetition
  const [sessionUsedWords, setSessionUsedWords] = useState<Set<string>>(new Set());

  const [sentenceQuestions, setSentenceQuestions] = useState<SentenceQuestion[]>([]);
  const [sentenceHistory, setSentenceHistory] = useState<Set<string>>(() => {
      try { const saved = localStorage.getItem('sentenceHistory'); return saved ? new Set(JSON.parse(saved) as string[]) : new Set(); } catch (e) { return new Set(); }
  });

  const [hangmanWords, setHangmanWords] = useState<{word: string, hint: string, hebrewHint: string, imagePrompt: string}[]>([]);
  const [hangmanHistory, setHangmanHistory] = useState<Set<string>>(() => {
      try { const saved = localStorage.getItem('hangmanHistory'); return saved ? new Set(JSON.parse(saved) as string[]) : new Set(); } catch (e) { return new Set(); }
  });
  
  const [rhymeQuestions, setRhymeQuestions] = useState<RhymeQuestion[]>([]);
  const [rhymeHistory, setRhymeHistory] = useState<Set<string>>(() => {
      try { const saved = localStorage.getItem('rhymeHistory'); return saved ? new Set(JSON.parse(saved) as string[]) : new Set(); } catch (e) { return new Set(); }
  });

  const [readingQuestions, setReadingQuestions] = useState<ReadingQuestion[]>([]);
  const [readingHistory, setReadingHistory] = useState<Set<string>>(() => {
      try { const saved = localStorage.getItem('readingHistory'); return saved ? new Set(JSON.parse(saved) as string[]) : new Set(); } catch (e) { return new Set(); }
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRhymes, setIsLoadingRhymes] = useState(false);
  
  const [snowmanLanguage, setSnowmanLanguage] = useState<'hebrew' | 'english'>('hebrew');
  const [hangmanLanguage, setHangmanLanguage] = useState<'hebrew' | 'english'>('hebrew');
  const [currentReward, setCurrentReward] = useState<GuriReward | null>(null);
  
  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Capture Install Prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault(); 
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // UNLOCK AUDIO CONTEXT ON FIRST INTERACTION
  useEffect(() => {
    const unlockAudio = () => {
      resumeAudioContext();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  // Persist Histories
  useEffect(() => { localStorage.setItem('sentenceHistory', JSON.stringify(Array.from(sentenceHistory))); }, [sentenceHistory]);
  useEffect(() => { localStorage.setItem('hangmanHistory', JSON.stringify(Array.from(hangmanHistory))); }, [hangmanHistory]);
  useEffect(() => { localStorage.setItem('rhymeHistory', JSON.stringify(Array.from(rhymeHistory))); }, [rhymeHistory]);
  useEffect(() => { localStorage.setItem('readingHistory', JSON.stringify(Array.from(readingHistory))); }, [readingHistory]);

  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    try {
        const saved = localStorage.getItem('userProgress');
        return saved ? JSON.parse(saved) : { totalCoins: 0, completedLevels: [] };
    } catch (e) {
        console.error("Corrupted userProgress in localStorage", e);
        return { totalCoins: 0, completedLevels: [] };
    }
  });
  
  useEffect(() => { localStorage.setItem('userProgress', JSON.stringify(userProgress)); }, [userProgress]);

  const handleResetScore = () => { setUserProgress(prev => ({ ...prev, totalCoins: 0 })); };

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('appSettings');
    const defaults: AppSettings = { childName: 'Tommy', soundEffects: true, autoPlayAudio: true, fontStyle: 'print', selectedPetId: 'guri' };
    if (!saved) return defaults;
    try { return { ...defaults, ...JSON.parse(saved) }; } catch (e) { return defaults; }
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
          setTimeout(() => { setCurrentReward({ ...reward, milestone: milestoneTarget }); }, 500);
      }
      return { ...prev, totalCoins: newTotal };
    });
  };

  useEffect(() => {
      const hasSelectedPet = localStorage.getItem('has_selected_pet');
      if (!hasSelectedPet) {
          setScreen(ScreenState.PET_SELECTION);
      }
  }, []);

  const getSelectedPet = (): PetProfile => PETS.find(p => p.id === settings.selectedPetId) || PETS[0];

  const handlePetSelection = (petId: string) => {
      handleSaveSettings({ ...settings, selectedPetId: petId });
      localStorage.setItem('has_selected_pet', 'true');
      setScreen(ScreenState.LEVEL_SELECT);
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
  };
  
  const handleLoadProgress = (newProgress: UserProgress) => { setUserProgress(newProgress); };

  useEffect(() => {
    const root = document.documentElement;
    let fontVal = "'Varela Round', sans-serif"; 
    if (settings.fontStyle === 'hand1') fontVal = "'Gveret Levin', cursive"; 
    if (settings.fontStyle === 'playpen') fontVal = "'Playpen Sans Hebrew', cursive"; 
    if (settings.fontStyle === 'alef') fontVal = "'Alef', sans-serif";
    root.style.setProperty('--dynamic-font', fontVal);
  }, [settings.fontStyle]);

  const handleResetProgress = () => {
    localStorage.clear();
    location.reload();
  };

  const [tutorialActive, setTutorialActive] = useState(false);
  const [tutorialSteps, setTutorialSteps] = useState<TutorialStep[]>([]);
  const [tutorialStepIndex, setTutorialStepIndex] = useState(0);

  const startTutorial = (steps: TutorialStep[]) => {
    setTutorialSteps(steps);
    setTutorialStepIndex(0);
    setTutorialActive(true);
  };

  const handleTutorialNext = () => {
    if (tutorialStepIndex < tutorialSteps.length - 1) setTutorialStepIndex(prev => prev + 1);
    else setTutorialActive(false);
  };

  const handleSelectLevel = async (level: LevelNode) => {
    setCurrentLevel(level);
    setIsLoading(true);
    setScreen(ScreenState.GAME_SESSION); 
    try {
      // PREVENT REPETITION: Pass used words from this session
      const generatedQuestions = await generateLevelContent(level.vowel, Array.from(sessionUsedWords));
      
      setQuestions(generatedQuestions);
      setNextQuestion(generatedQuestions.length > 1 ? generatedQuestions[1] : undefined);
      setCurrentQuestionIndex(0);

      // Track these words as used
      const newUsed = new Set(sessionUsedWords);
      generatedQuestions.forEach(q => newUsed.add(q.word));
      setSessionUsedWords(newUsed);

      const hasSeenGameTutorial = localStorage.getItem('tutorial_game_completed');
      if (!hasSeenGameTutorial) {
        setTimeout(() => {
          startTutorial([{ message: "הנה האתגר הראשון שלכם!" }, { message: "לחצו על המילה הגדולה כדי לשמוע איך אומרים אותה." }, { message: "לאחר מכן, בחרו את התרגום הנכון באנגלית מהכפתורים למטה." }]);
          localStorage.setItem('tutorial_game_completed', 'true');
        }, 500);
      }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const handleLoadMorePractice = async () => {
      if (!currentLevel) return;
      setIsLoading(true);
      try {
          // PREVENT REPETITION: Filter out words already used in this session
          const newQuestions = await generateLevelContent(currentLevel.vowel, Array.from(sessionUsedWords));
          
          if (newQuestions.length > 0) {
              const newUsed = new Set(sessionUsedWords);
              newQuestions.forEach(q => newUsed.add(q.word));
              setSessionUsedWords(newUsed);

              setQuestions(prev => [...prev, ...newQuestions]);
              setCurrentQuestionIndex(prev => prev + 1);
              setNextQuestion(newQuestions.length > 0 ? newQuestions[0] : undefined);
          } else {
              // If completely exhausted, just loop back but clear session history for this level
              setSessionUsedWords(new Set());
              handleLoadMorePractice();
          }
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const handleCorrectAnswer = async () => {
    handleEarnPoints(3);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setNextQuestion(questions[currentQuestionIndex + 2]);
    } else {
      await handleLoadMorePractice();
    }
  };

  const handleWrongAnswer = () => {};
  const handleLevelComplete = () => { setScreen(ScreenState.VICTORY); };
  const handleSnowmanComplete = () => { handleLevelComplete(); };
  const handleBackToMap = () => { 
    setScreen(ScreenState.LEVEL_SELECT); 
    setQuestions([]); 
    setCurrentLevel(null); 
  };
  const handleBackToMiniPractice = () => { setScreen(ScreenState.MINI_PRACTICE_SELECT); };

  // --- START OF MISSING HANDLERS FIX ---

  // Handler for initializing Hangman game with a specific language
  const handleStartHangman = async (lang: 'hebrew' | 'english') => {
    setHangmanLanguage(lang);
    setIsLoading(true);
    try {
      const words = await generateHangmanWords(lang, Array.from(hangmanHistory));
      setHangmanWords(words);
      setHangmanHistory(prev => {
        const next = new Set(prev);
        words.forEach(w => next.add(w.word));
        return next;
      });
    } catch (e) {
      console.error("Failed to start Hangman:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for loading more Hangman words
  const handleLoadMoreHangman = async (lang: 'hebrew' | 'english') => {
    try {
      const more = await generateHangmanWords(lang, Array.from(hangmanHistory));
      setHangmanWords(prev => [...prev, ...more]);
      setHangmanHistory(prev => {
        const next = new Set(prev);
        more.forEach(w => next.add(w.word));
        return next;
      });
    } catch (e) {
      console.error("Failed to load more Hangman words:", e);
    }
  };

  // Handler for loading more Rhyme questions
  const handleLoadMoreRhymes = async () => {
    setIsLoadingRhymes(true);
    try {
      const more = await generateRhymeQuestions(Array.from(rhymeHistory));
      setRhymeQuestions(prev => [...prev, ...more]);
      setRhymeHistory(prev => {
        const next = new Set(prev);
        more.forEach(q => next.add(q.targetWord));
        return next;
      });
    } catch (e) {
      console.error("Failed to load more Rhymes:", e);
    } finally {
      setIsLoadingRhymes(false);
    }
  };

  // Handler for Reading game actions (restart or load more)
  const handleReadingGameAction = async (action: 'more' | 'restart', lang: 'hebrew' | 'english') => {
    if (action === 'restart') {
      setIsLoading(true);
      try {
        const qs = await generateReadingQuestions([], lang);
        setReadingQuestions(qs);
        setReadingHistory(new Set(qs.map(q => q.id)));
      } catch (e) {
        console.error("Failed to restart Reading game:", e);
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        const more = await generateReadingQuestions(Array.from(readingHistory), lang);
        setReadingQuestions(prev => [...prev, ...more]);
        setReadingHistory(prev => {
          const next = new Set(prev);
          more.forEach(q => next.add(q.id));
          return next;
        });
      } catch (e) {
        console.error("Failed to load more Reading questions:", e);
      }
    }
  };

  // Handler for initializing Snowman (Sentences) game
  const handleSentenceGameStart = async (lang: 'hebrew' | 'english') => {
    setSnowmanLanguage(lang);
    setIsLoading(true);
    try {
      const qs = await generateSentenceQuestions(lang, Array.from(sentenceHistory));
      setSentenceQuestions(qs);
      setSentenceHistory(prev => {
        const next = new Set(prev);
        qs.forEach(q => next.add(q.fullSentence));
        return next;
      });
    } catch (e) {
      console.error("Failed to start Snowman game:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for loading more Snowman sentences
  const handleLoadMoreSentences = async (lang: 'hebrew' | 'english') => {
    try {
      const more = await generateSentenceQuestions(lang, Array.from(sentenceHistory));
      setSentenceQuestions(prev => [...prev, ...more]);
      setSentenceHistory(prev => {
        const next = new Set(prev);
        more.forEach(q => next.add(q.fullSentence));
        return next;
      });
    } catch (e) {
      console.error("Failed to load more sentences:", e);
    }
  };

  // Effect to handle initial data load for games that don't have an internal language menu
  useEffect(() => {
    if (screen === ScreenState.RHYME_GAME && rhymeQuestions.length === 0) {
      handleLoadMoreRhymes();
    }
    if (screen === ScreenState.READING_GAME && readingQuestions.length === 0) {
      handleReadingGameAction('restart', 'hebrew');
    }
  }, [screen]);

  // --- END OF MISSING HANDLERS FIX ---

  const showTopBar = ([ScreenState.LEVEL_SELECT, ScreenState.GAME_SESSION] as ScreenState[]).includes(screen);

  return (
    <div className="relative w-full h-[100dvh] md:w-[95vw] md:h-[95dvh] md:max-h-[100dvh] md:max-w-[1400px] bg-white md:rounded-[2rem] shadow-2xl overflow-hidden md:border-[8px] border-slate-800 md:ring-4 ring-slate-900/50 select-none flex flex-col mx-auto my-auto transition-all duration-300">
      {showTopBar && <TopBar progress={userProgress} onHome={handleBackToMap} onOpenSettings={() => setIsSettingsOpen(true)} />}
      
      {screen === ScreenState.PET_SELECTION && <PetSelection onSelect={handlePetSelection} />}
      {screen === ScreenState.LEVEL_SELECT && <LevelMap onSelectLevel={handleSelectLevel} onQuickPlay={() => { setReturnScreen(ScreenState.LEVEL_SELECT); setScreen(ScreenState.SNOWMAN_GAME); }} onOpenTongueTwisters={() => setScreen(ScreenState.TONGUE_TWISTERS)} onOpenMiniPractice={() => setScreen(ScreenState.MINI_PRACTICE_SELECT)} />}
      {screen === ScreenState.MINI_PRACTICE_SELECT && <MiniPracticeGrid onSelectOption={(id) => setScreen(id as any)} onBack={handleBackToMap} />}
      
      {screen === ScreenState.MATCHING_GAME && <MatchingGame onBack={handleBackToMiniPractice} settings={settings} onEarnPoints={handleEarnPoints} />}
      {screen === ScreenState.NAMING_GAME && <NamingGame onBack={handleBackToMiniPractice} settings={settings} onEarnPoints={handleEarnPoints} />}
      {screen === ScreenState.WRITING_GAME && <WritingGame onBack={handleBackToMiniPractice} settings={settings} onEarnPoints={handleEarnPoints} />}
      {screen === ScreenState.MEMORY_GAME && <MemoryGame onBack={handleBackToMiniPractice} onEarnPoints={handleEarnPoints} />}
      {screen === ScreenState.DICTATION_GAME && <DictationGame onBack={handleBackToMiniPractice} onEarnPoints={handleEarnPoints} />}
      {screen === ScreenState.HANGMAN_GAME && !isLoading && <HangmanGame words={hangmanWords} onBack={handleBackToMiniPractice} onLoadMore={handleLoadMoreHangman} onEarnPoints={handleEarnPoints} onStartGame={handleStartHangman} language={hangmanLanguage} />}
      {screen === ScreenState.RHYME_GAME && !isLoading && <RhymeGame questions={rhymeQuestions} onBack={handleBackToMiniPractice} onLoadMore={handleLoadMoreRhymes} onEarnPoints={handleEarnPoints} />}
      {screen === ScreenState.READING_GAME && !isLoading && <ReadingGame questions={readingQuestions} onBack={handleBackToMiniPractice} onGameAction={handleReadingGameAction} onEarnPoints={handleEarnPoints} />}
      {screen === ScreenState.TONGUE_TWISTERS && <TongueTwisters onBack={handleBackToMap} />}
      {screen === ScreenState.SNOWMAN_GAME && !isLoading && <SnowmanGame questions={sentenceQuestions} onComplete={handleSnowmanComplete} onBack={() => setScreen(returnScreen)} onLoadMore={handleLoadMoreSentences} onStartGame={handleSentenceGameStart} settings={settings} onEarnPoints={handleEarnPoints} language={snowmanLanguage} />}

      {isLoading && (
        <div className="flex flex-col items-center justify-center h-full bg-indigo-50 md:rounded-[2.5rem] z-[100]">
          <div className="w-24 h-24 border-8 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <h2 className="text-3xl font-black text-indigo-700 animate-pulse font-dynamic">...טּוֹעֵן (Loading)</h2>
        </div>
      )}

      {screen === ScreenState.GAME_SESSION && currentLevel && questions[currentQuestionIndex] && (
        <div className="h-full w-full bg-indigo-50 pt-16 md:pt-20 relative overflow-hidden flex flex-col">
           <div className="container mx-auto px-4 relative z-10 flex-1 flex flex-col">
             <div className="text-center mb-1 md:mb-2 shrink-0">
               <h1 className="text-xl md:text-2xl font-black text-indigo-700 font-dynamic">{currentLevel.name}</h1>
               <p className="text-indigo-500 text-xs md:text-sm font-bold font-dynamic">{currentLevel.description}</p>
             </div>
             <div className="flex-1 min-h-0">
                 <MiniGame question={questions[currentQuestionIndex]} nextQuestion={questions[currentQuestionIndex+1]} totalQuestions={questions.length} questionNumber={currentQuestionIndex + 1} onCorrect={handleCorrectAnswer} onWrong={handleWrongAnswer} isTutorialActive={tutorialActive} settings={settings} />
             </div>
           </div>
        </div>
      )}

      {screen === ScreenState.VICTORY && (
        <div className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-yellow-100 to-orange-100 p-4 text-center overflow-hidden">
          <div className="mb-8 pop-in"><span className="text-9xl filter drop-shadow-lg">🏆</span></div>
          <h1 className="text-5xl md:text-6xl font-black text-orange-500 mb-4 drop-shadow-sm font-round">כָּל הַכָּבוֹד!</h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">{settings.childName ? `Amazing job, ${settings.childName}!` : "You did an amazing job!"}</p>
          <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 flex items-center gap-4">
            <span className="text-yellow-500 text-4xl">💰</span>
            <span className="text-4xl font-bold text-gray-800">Total: {userProgress.totalCoins}</span>
          </div>
          <Button onClick={handleBackToMap} color="green" size="lg">חזרה לתפריט</Button>
        </div>
      )}
      
      {tutorialActive && <TutorialOverlay steps={tutorialSteps} currentStepIndex={tutorialStepIndex} onNext={handleTutorialNext} onComplete={() => setTutorialActive(false)} pet={getSelectedPet()} />}
      {currentReward && <RewardOverlay reward={currentReward} onClose={() => setCurrentReward(null)} pet={getSelectedPet()} />}
      
      {isSettingsOpen && <SettingsModal settings={settings} userProgress={userProgress} onSave={handleSaveSettings} onClose={() => setIsSettingsOpen(false)} onResetProgress={handleResetProgress} onLoadProgress={handleLoadProgress} onResetScore={handleResetScore} pets={PETS} deferredPrompt={deferredPrompt} />}
      
      <FontControl currentFont={settings.fontStyle} onChange={(f) => handleSaveSettings({...settings, fontStyle: f})} />
      <button onClick={() => setIsSettingsOpen(true)} className={`absolute z-[200] bg-white/90 p-3 rounded-full shadow-md border-2 border-gray-200 hover:rotate-90 transition-transform duration-300 bottom-4 right-4 md:bottom-8 md:right-8`} title="הגדרות">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      </button>
    </div>
  );
};
